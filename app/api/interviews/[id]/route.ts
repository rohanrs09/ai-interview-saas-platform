import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/clerk'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, users, jobDescriptions, feedbackReports } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const sessionId = params.id

    // Get the interview session with related data
    const sessionResult = await db
      .select({
        session: interviewSessions,
        job: jobDescriptions,
        user: users,
      })
      .from(interviewSessions)
      .leftJoin(jobDescriptions, eq(interviewSessions.jobId, jobDescriptions.id))
      .leftJoin(users, eq(interviewSessions.candidateId, users.id))
      .where(and(
        eq(interviewSessions.id, sessionId),
        eq(interviewSessions.candidateId, userId)
      ))
      .limit(1)

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { session, job, user } = sessionResult[0]

    // Get questions for this session
    const sessionQuestions = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.sessionId, sessionId))

    // Get feedback report if exists
    const feedbackResult = await db
      .select()
      .from(feedbackReports)
      .where(eq(feedbackReports.sessionId, sessionId))
      .limit(1)

    return NextResponse.json({
      session: {
        ...session,
        jobTitle: job?.title || 'General Interview',
        jobDescription: job?.description || null,
        questions: sessionQuestions.map(q => ({
          id: q.id,
          text: q.questionText,
          type: q.questionType,
          skillTag: q.skillTag || 'general'
        })),
        analysis: feedbackResult.length > 0 ? {
          overallScore: feedbackResult[0].overallScore,
          summary: feedbackResult[0].summary,
          strengths: feedbackResult[0].strengths || [],
          areasForImprovement: feedbackResult[0].areasForImprovement || [],
          skillAssessments: feedbackResult[0].skillAssessments || [],
          recommendations: feedbackResult[0].recommendations || []
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching interview session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const sessionId = params.id
    const body = await request.json()

    // Verify the session belongs to the current user
    const sessionResult = await db
      .select()
      .from(interviewSessions)
      .where(and(
        eq(interviewSessions.id, sessionId),
        eq(interviewSessions.candidateId, userId)
      ))
      .limit(1)

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Update the session
    const updatedSession = await db
      .update(interviewSessions)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(eq(interviewSessions.id, sessionId))
      .returning()

    return NextResponse.json({
      session: updatedSession[0],
      message: 'Session updated successfully'
    })
  } catch (error) {
    console.error('Error updating interview session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
