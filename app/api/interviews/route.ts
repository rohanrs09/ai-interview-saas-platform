import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, candidateProfiles, jobDescriptions } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get candidate profile and job description
    const [candidateProfile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1)

    const [jobDescription] = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, jobId))
      .limit(1)

    if (!candidateProfile || !jobDescription) {
      return NextResponse.json({ error: 'Profile or job not found' }, { status: 404 })
    }

    // Calculate skill gaps
    const candidateSkills = candidateProfile.extractedSkills || []
    const jobSkills = jobDescription.requiredSkills || []
    
    const skillGaps = jobSkills.filter((skill: string) => 
      !candidateSkills.some((candidateSkill: string) => 
        candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(candidateSkill.toLowerCase())
      )
    )

    // Generate interview questions for skill gaps
    const questions = await aiService.generateInterviewQuestions(
      skillGaps, 
      jobDescription.title
    )

    // Create interview session
    const [newSession] = await db
      .insert(interviewSessions)
      .values({
        candidateId: userId,
        jobId,
        skillGaps,
        status: 'pending',
      })
      .returning()

    // Create interview questions
    const questionRecords = questions.map((q, index) => ({
      sessionId: newSession.id,
      skillTag: q.skill,
      questionText: q.question,
      order: index + 1,
    }))

    await db.insert(interviewQuestions).values(questionRecords)

    return NextResponse.json({ 
      success: true, 
      sessionId: newSession.id,
      questions: questions.map((q, index) => ({
        id: index + 1,
        skill: q.skill,
        question: q.question,
      }))
    })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { error: 'Failed to create interview' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get specific interview session
      const [session] = await db
        .select()
        .from(interviewSessions)
        .where(and(
          eq(interviewSessions.id, sessionId),
          eq(interviewSessions.candidateId, userId)
        ))
        .limit(1)

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // Get questions for this session
      const questions = await db
        .select()
        .from(interviewQuestions)
        .where(eq(interviewQuestions.sessionId, sessionId))
        .orderBy(interviewQuestions.order)

      return NextResponse.json({ session, questions })
    } else {
      // Get all interview sessions for user
      const sessions = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.candidateId, userId))
        .orderBy(interviewSessions.createdAt)

      return NextResponse.json({ sessions })
    }
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' }, 
      { status: 500 }
    )
  }
}
