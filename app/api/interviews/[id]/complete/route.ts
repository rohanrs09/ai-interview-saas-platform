import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, feedbackReports, jobDescriptions } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq, and } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get interview session
    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(and(
        eq(interviewSessions.id, params.id),
        eq(interviewSessions.candidateId, userId)
      ))
      .limit(1)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get job description
    const [jobDescription] = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, session.jobId))
      .limit(1)

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 })
    }

    // Get all questions and answers
    const questions = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.sessionId, params.id))
      .orderBy(interviewQuestions.order)

    // Prepare data for AI analysis
    const questionsWithAnswers = questions
      .filter(q => q.answerText)
      .map(q => ({
        skill: q.skillTag,
        question: q.questionText,
        answer: q.answerText || '',
      }))

    // Generate AI feedback
    const feedback = await aiService.analyzeInterviewPerformance(
      questionsWithAnswers,
      jobDescription.title
    )

    // Create feedback report
    const [feedbackReport] = await db
      .insert(feedbackReports)
      .values({
        sessionId: params.id,
        summary: feedback.summary,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        ratedSkills: feedback.ratedSkills,
        overallScore: feedback.overallScore,
        recommendations: feedback.recommendations,
      })
      .returning()

    // Update session status
    await db
      .update(interviewSessions)
      .set({
        status: 'completed',
        totalScore: feedback.overallScore,
        updatedAt: new Date(),
      })
      .where(eq(interviewSessions.id, params.id))

    return NextResponse.json({ 
      success: true, 
      feedbackReport 
    })
  } catch (error) {
    console.error('Error completing interview:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview' }, 
      { status: 500 }
    )
  }
}
