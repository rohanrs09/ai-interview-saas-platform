import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewSessions, jobDescriptions, interviewQuestions } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, jobTitle, jobDescription, companyName, difficulty = 'intermediate', duration = 30, experience = 'entry' } = body

    // Create or get job description
    let actualJobId = jobId
    if (!actualJobId) {
      const newJob = await db.insert(jobDescriptions).values({
        title: jobTitle || 'General Interview',
        company: companyName || 'Tech Company',
        description: jobDescription || 'A general technical interview',
        location: 'Remote',
        jobType: 'full-time',
        experience: experience,
        requiredSkills: [],
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedTime: duration,
        questionsCount: 5,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      actualJobId = newJob[0].id
    }

    // Create interview session
    const session = await db.insert(interviewSessions).values({
      candidateId: userId,
      jobId: actualJobId,
      status: 'pending',
      scheduledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()
    
    const sessionId = session[0].id

    // Generate default questions if none provided
    const questions = body.questions || []

    // Generate initial questions (mock for now, will integrate with AI)
    const initialQuestions = [
      {
        questionText: `Tell me about yourself and your experience relevant to the ${jobTitle || 'position'}.`,
        type: 'behavioral' as const,
        difficulty: 'beginner' as const,
        timeLimit: 120,
        order: 1
      },
      {
        questionText: 'What are your greatest strengths and how do they align with this role?',
        type: 'behavioral' as const,
        difficulty: 'beginner' as const,
        timeLimit: 120,
        order: 2
      },
      {
        questionText: 'Describe a challenging technical problem you solved recently.',
        type: 'technical' as const,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        timeLimit: 180,
        order: 3
      },
      {
        questionText: 'How do you stay updated with the latest technology trends?',
        type: 'behavioral' as const,
        difficulty: 'beginner' as const,
        timeLimit: 120,
        order: 4
      },
      {
        questionText: 'Where do you see yourself in 5 years?',
        type: 'behavioral' as const,
        difficulty: 'beginner' as const,
        timeLimit: 120,
        order: 5
      }
    ]

    // Combine with any provided questions
    const allQuestions = [...questions, ...initialQuestions]

    // Insert questions into database
    for (const [index, question] of allQuestions.entries()) {
      await db.insert(interviewQuestions).values({
        sessionId,
        questionText: question.questionText,
        type: question.type || 'behavioral',
        skillTag: question.skillTag || 'general',
        difficulty: question.difficulty || 'intermediate',
        timeLimit: question.timeLimit || 120,
        order: index + 1
      })
    }
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Interview session created successfully',
      totalQuestions: allQuestions.length,
      estimatedDuration: duration
    })

  } catch (error) {
    console.error('Error creating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
