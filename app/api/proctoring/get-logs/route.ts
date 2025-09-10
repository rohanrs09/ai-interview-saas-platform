import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { proctoringLogs, interviewSessions } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify session belongs to user
    const session = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1)

    if (!session.length || session[0].candidateId !== userId) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }

    // Get proctoring logs for the session
    const logs = await db
      .select()
      .from(proctoringLogs)
      .where(eq(proctoringLogs.sessionId, sessionId))
      .orderBy(desc(proctoringLogs.timestamp))

    // Categorize logs by severity and type
    const summary = {
      total: logs.length,
      high: logs.filter(log => log.severity === 'high').length,
      medium: logs.filter(log => log.severity === 'medium').length,
      low: logs.filter(log => log.severity === 'low').length,
      eventTypes: logs.reduce((acc, log) => {
        acc[log.eventType] = (acc[log.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        eventType: log.eventType,
        timestamp: log.timestamp,
        severity: log.severity,
        data: log.data
      })),
      summary
    })

  } catch (error) {
    console.error('Error fetching proctoring logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proctoring logs' },
      { status: 500 }
    )
  }
}
