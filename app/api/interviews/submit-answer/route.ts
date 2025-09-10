import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewQuestions } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, answer, sessionId } = await request.json()

    if (!questionId || !answer || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the question details
    const question = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.id, questionId))
      .limit(1)

    if (!question.length) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const questionData = question[0]

    // Evaluate the answer using AI
    const evaluation = await aiService.evaluateAnswer(
      questionData.questionText,
      answer,
      questionData.skillTag
    )

    // Update the question with the answer and evaluation
    await db
      .update(interviewQuestions)
      .set({
        answerText: answer,
        score: evaluation.score
      })
      .where(eq(interviewQuestions.id, questionId))

    return NextResponse.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions
      }
    })

  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
