import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, feedbackReports } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get session details
    const session = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1)

    if (!session.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get all questions and answers for this session
    const questions = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.sessionId, sessionId))

    if (!questions.length) {
      return NextResponse.json({ error: 'No questions found for session' }, { status: 404 })
    }

    // Calculate scores and prepare data for AI feedback generation
    const scores = questions.map(q => q.score || 0)
    const answers = questions.map(q => ({
      questionText: q.questionText,
      answer: q.answerText || '',
      score: q.score || 0,
      skillTag: q.skillTag
    }))

    // Get candidate skills from session or use fallback
    const candidateSkills = questions.map(q => q.skillTag).filter(Boolean)
    const uniqueSkills = [...new Set(candidateSkills)]

    // Generate comprehensive feedback report
    const feedbackReport = await aiService.generateFeedbackReport({
      questions,
      answers,
      scores,
      candidateSkills: uniqueSkills,
      jobTitle: 'Software Developer' // This should come from job description
    })

    // Save feedback report to database
    const [report] = await db.insert(feedbackReports).values({
      sessionId,
      overallScore: feedbackReport.overallScore,
      summary: feedbackReport.summary,
      strengths: JSON.stringify(feedbackReport.strengths),
      weaknesses: JSON.stringify(feedbackReport.weaknesses),
      recommendations: JSON.stringify(feedbackReport.recommendations),
      ratedSkills: feedbackReport.skillAssessment
    }).returning()

    // Update session status to completed
    await db
      .update(interviewSessions)
      .set({
        status: 'completed'
      })
      .where(eq(interviewSessions.id, sessionId))

    return NextResponse.json({
      success: true,
      reportId: report.id,
      feedbackReport,
      message: 'Interview completed and feedback generated'
    })

  } catch (error) {
    console.error('Error completing interview session:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview session' },
      { status: 500 }
    )
  }
}
