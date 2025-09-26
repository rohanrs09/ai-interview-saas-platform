import { NextResponse } from 'next/server';
import { requireAuth, getCurrentUserWithRole } from '@/lib/clerk';
import { db } from '@/lib/db';
import { interviewSessions, interviewTranscripts, interviewFeedback } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    const { sessionId, transcripts, duration, questionCount, completedQuestions } = await request.json();
    
    if (!sessionId || !transcripts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the session belongs to the current user
    const session = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
    }

    // Convert transcripts to text format for legacy support
    const transcriptText = transcripts
      .map((t: any) => `${t.speaker}: ${t.text}`)
      .join('\n');

    // Begin a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Update interview session with transcript summary
      await tx
        .update(interviewSessions)
        .set({ 
          transcript: transcriptText,
          duration: duration || 0,
          status: completedQuestions >= questionCount ? 'completed' : 'partial',
          completedAt: new Date()
        })
        .where(eq(interviewSessions.id, sessionId));
      
      // Delete any existing transcripts for this session (in case of retries)
      await tx
        .delete(interviewTranscripts)
        .where(eq(interviewTranscripts.sessionId, sessionId));
      
      // Store detailed transcripts with question associations
      for (const transcript of transcripts) {
        await tx.insert(interviewTranscripts).values({
          id: uuidv4(),
          sessionId,
          speaker: transcript.speaker,
          text: transcript.text,
          timestamp: new Date(transcript.timestamp),
          questionId: transcript.questionId || null,
          duration: transcript.duration || null,
          confidence: transcript.confidence || null
        });
      }
    });

    // Queue the interview for AI analysis if completed
    if (completedQuestions >= questionCount) {
      try {
        await fetch('/api/analysis/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (analysisError) {
        console.error('Failed to queue interview for analysis:', analysisError);
        // Continue with success response even if analysis queuing fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transcript saved successfully',
      status: completedQuestions >= questionCount ? 'completed' : 'partial',
      progress: {
        completed: completedQuestions,
        total: questionCount
      }
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json({ 
      error: 'Failed to save transcript' 
    }, { status: 500 });
  }
}
