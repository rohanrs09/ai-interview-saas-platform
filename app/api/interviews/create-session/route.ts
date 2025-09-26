import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/clerk'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, jobDescriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { AIAnalysisService } from '@/lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await request.json()
    const { jobId, customQuestions, sessionType = 'general' } = body

    let jobData = null
    let generatedQuestions: any[] = []

    // If jobId provided, fetch job details and generate questions
    if (jobId) {
      const jobResult = await db
        .select()
        .from(jobDescriptions)
        .where(eq(jobDescriptions.id, jobId))
        .limit(1)

      if (jobResult.length > 0) {
        jobData = jobResult[0]

        // Generate AI questions based on job description
        const aiService = new AIAnalysisService()
        try {
          // map beginner/intermediate/advanced → entry/mid/senior
          const experienceMap: Record<"beginner" | "intermediate" | "advanced", "entry" | "mid" | "senior"> = {
            beginner: "entry",
            intermediate: "mid",
            advanced: "senior",
          }

          const normalizedExperience =
            jobData.experienceLevel
              ? experienceMap[jobData.experienceLevel]
              : "mid" // fallback

          generatedQuestions = await aiService.generateQuestionsFromJobDescription(
            jobData.title,
            jobData.description,
            jobData.requiredSkills || [],
            normalizedExperience
          )
        } catch (error) {
          console.error('Error generating AI questions, using fallback:', error)
          generatedQuestions = [
            {
              questionText: `Tell me about your experience relevant to the ${jobData.title} position.`,
              type: 'behavioral',
              skillTag: 'experience'
            },
            {
              questionText: `What interests you about working at ${jobData.company}?`,
              type: 'behavioral',
              skillTag: 'motivation'
            },
            {
              questionText: `Describe a challenging project you've worked on recently.`,
              type: 'behavioral',
              skillTag: 'problem-solving'
            }
          ]
        }
      }
    } else if (customQuestions && customQuestions.length > 0) {
      // Use provided custom questions
      const questionInserts = customQuestions.map((q: any, index: number) => ({
        sessionId: null,
        questionText: q.text || q.questionText,
        questionType: q.type || q.questionType || 'behavioral',
        difficulty: q.difficulty || 'intermediate',
        skillTag: q.skillTag || 'general',
        order: index + 1,
        timeLimit: 120 // 2 minutes per question
      }))
      generatedQuestions = questionInserts
    } else {
      // Default general interview questions
      generatedQuestions = [
        {
          questionText: 'Tell me about yourself and your professional background.',
          questionType: 'behavioral',
          skillTag: 'communication'
        },
        {
          questionText: 'What are your greatest strengths and how do they apply to this role?',
          questionType: 'behavioral',
          skillTag: 'self-awareness'
        },
        {
          questionText: 'Describe a challenging situation you faced at work and how you handled it.',
          questionType: 'behavioral',
          skillTag: 'problem-solving'
        },
        {
          questionText: 'Where do you see yourself in 5 years?',
          questionType: 'behavioral',
          skillTag: 'career-planning'
        },
        {
          questionText: 'Why are you interested in this position?',
          questionType: 'behavioral',
          skillTag: 'motivation'
        }
      ]
    }

    // Create the interview session
    const sessionResult = await db
      .insert(interviewSessions)
      .values({
        candidateId: userId,
        jobId: jobId || null,
        status: 'pending',
        scheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    const session = sessionResult[0]

    // Create questions for this session
    const questionPromises = generatedQuestions.map((q, index) =>
      db.insert(interviewQuestions).values({
        sessionId: session.id,
        questionText: q.questionText,
        questionType: (q.questionType || 'behavioral') as 'behavioral' | 'technical' | 'situational',
        skillTag: q.skillTag,
        difficulty: 'intermediate',
        order: index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
    )

    const createdQuestions = await Promise.all(questionPromises)

    return NextResponse.json({
      session: {
        ...session,
        jobTitle: jobData?.title || 'General Interview',
        jobDescription: jobData?.description || null,
        questions: createdQuestions.map(q => q[0])
      },
      message: 'Interview session created successfully'
    })
  } catch (error) {
    console.error('Error creating interview session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
