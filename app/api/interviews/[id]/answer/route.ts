import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewQuestions, interviewSessions } from '@/lib/schema'
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

    const { questionId, answer } = await request.json()
    
    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Question ID and answer are required' }, { status: 400 })
    }

    // Verify the question belongs to the user's session
    const [question] = await db
      .select({
        id: interviewQuestions.id,
        sessionId: interviewQuestions.sessionId,
      })
      .from(interviewQuestions)
      .innerJoin(interviewSessions, eq(interviewQuestions.sessionId, interviewSessions.id))
      .where(and(
        eq(interviewQuestions.id, questionId),
        eq(interviewSessions.candidateId, userId),
        eq(interviewSessions.id, params.id)
      ))
      .limit(1)

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Update the question with the answer
    await db
      .update(interviewQuestions)
      .set({
        answerText: answer,
        updatedAt: new Date(),
      })
      .where(eq(interviewQuestions.id, questionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' }, 
      { status: 500 }
    )
  }
}
