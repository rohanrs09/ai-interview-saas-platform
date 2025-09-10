import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { proctoringLogs, interviewSessions } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, deviceInfo, permissions } = await request.json()

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

    // Log proctoring session start
    await db.insert(proctoringLogs).values({
      sessionId,
      eventType: 'session_start',
      data: {
        deviceInfo,
        permissions,
        timestamp: new Date().toISOString()
      },
      severity: 'low'
    })

    return NextResponse.json({
      success: true,
      message: 'Proctoring session started',
      config: {
        videoEnabled: permissions?.camera || false,
        audioEnabled: permissions?.microphone || false,
        screenRecording: permissions?.screen || false,
        faceDetection: true,
        anomalyDetection: true
      }
    })

  } catch (error) {
    console.error('Error starting proctoring session:', error)
    return NextResponse.json(
      { error: 'Failed to start proctoring session' },
      { status: 500 }
    )
  }
}
