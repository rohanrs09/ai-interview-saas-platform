import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { feedbackReports, interviewSessions } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportId } = params

    // Get feedback report
    const report = await db
      .select()
      .from(feedbackReports)
      .where(eq(feedbackReports.id, reportId))
      .limit(1)

    if (!report.length) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const reportData = report[0]

    // Get associated session to verify ownership
    const sessionData = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, reportData.sessionId))
      .limit(1)

    if (!sessionData.length || sessionData[0].candidateId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      report: {
        id: reportData.id,
        sessionId: reportData.sessionId,
        overallScore: reportData.overallScore,
        summary: reportData.summary,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        skillAssessment: reportData.ratedSkills,
        createdAt: reportData.createdAt
      },
      session: sessionData.length ? sessionData[0] : null
    })

  } catch (error) {
    console.error('Error fetching feedback report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback report' },
      { status: 500 }
    )
  }
}
