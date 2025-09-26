import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk';
import { db } from '@/lib/db';
import { interviewSessions, interviewQuestions, jobDescriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { aiAnalysisService } from '@/lib/ai-analysis';
import type { QuestionAnswer } from '@/lib/ai-analysis';

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get interview session details
    const session = await db
      .select({
        session: interviewSessions,
        jobTitle: jobDescriptions.title,
        jobDescription: jobDescriptions.description
      })
      .from(interviewSessions)
      .leftJoin(jobDescriptions, eq(interviewSessions.jobId, jobDescriptions.id))
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = session[0];

    // Get interview questions and answers
    const questions = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.sessionId, sessionId));

    // Convert to QuestionAnswer format
    const questionAnswers: QuestionAnswer[] = questions.map(q => ({
        questionId: q.id,
        questionText: q.questionText,
        answerText: q.answerText || '',
        questionType: q.questionType,
        skillTag: q.skillTag,
        timeSpent: q.timeLimit ?? undefined,  // null becomes undefined
      }));      

    if (questionAnswers.length === 0) {
      return NextResponse.json({ error: 'No questions found for this session' }, { status: 400 });
    }

    // Run AI analysis
    const analysis = await aiAnalysisService.analyzeInterview(
      sessionId,
      questionAnswers,
      sessionData.session.transcript || undefined,
      sessionData.jobDescription || undefined
    );

    return NextResponse.json({ 
      success: true, 
      analysis,
      message: 'Interview analysis completed successfully' 
    });
  } catch (error) {
    console.error('Error analyzing interview:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze interview' 
    }, { status: 500 });
  }
}
