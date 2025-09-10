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

    const { sessionId, eventType, data, severity = 'low' } = await request.json()

    if (!sessionId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Log the proctoring event
    await db.insert(proctoringLogs).values({
      sessionId,
      eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      severity
    })

    // Determine if this is a suspicious event that needs immediate attention
    const suspiciousEvents = [
      'face_not_detected',
      'multiple_faces',
      'tab_switch',
      'window_blur',
      'fullscreen_exit',
      'copy_paste_detected',
      'right_click_detected'
    ]

    const isSuspicious = suspiciousEvents.includes(eventType)
    
    return NextResponse.json({
      success: true,
      logged: true,
      suspicious: isSuspicious,
      message: isSuspicious ? 'Suspicious activity detected and logged' : 'Event logged successfully'
    })

  } catch (error) {
    console.error('Error logging proctoring event:', error)
    return NextResponse.json(
      { error: 'Failed to log proctoring event' },
      { status: 500 }
    )
  }
}
