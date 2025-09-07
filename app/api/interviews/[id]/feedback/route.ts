import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { feedbackReports, interviewSessions } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the session belongs to the user
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

    // Get feedback report
    const [feedback] = await db
      .select()
      .from(feedbackReports)
      .where(eq(feedbackReports.sessionId, params.id))
      .limit(1)

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' }, 
      { status: 500 }
    )
  }
}
