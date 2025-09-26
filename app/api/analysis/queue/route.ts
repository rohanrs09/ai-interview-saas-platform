import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/clerk';
import { db } from '@/lib/db';
import { interviewSessions, interviewTranscripts, interviewQuestions, feedbackReports } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { AIAnalysisService } from '@/lib/ai-analysis';
import { UserRole } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to queue an interview for AI analysis
 * This can be triggered automatically after interview completion
 * or manually by a recruiter
 */
export async function POST(request: Request) {
  try {
    // Only allow candidates and recruiters to queue analysis
    const user = await requireRole([UserRole.CANDIDATE, UserRole.RECRUITER]);
    
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Verify the session exists and is completed
    const session = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
    }

    if (session.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Interview must be completed before analysis', 
        status: session.status 
      }, { status: 400 });
    }

    // Check if analysis already exists
    const existingFeedback = await db.query.feedbackReports.findFirst({
      where: eq(feedbackReports.sessionId, sessionId),
    });

    if (existingFeedback) {
      return NextResponse.json({ 
        message: 'Analysis already exists for this session',
        feedbackId: existingFeedback.id
      });
    }

    // Fetch all transcripts for this session
    const transcripts = await db.query.interviewTranscripts.findMany({
      where: eq(interviewTranscripts.sessionId, sessionId),
      orderBy: (transcripts, { asc }) => [asc(transcripts.timestamp)]
    });

    // Fetch questions for this session
    const questions = await db.query.interviewQuestions.findMany({
      where: eq(interviewQuestions.sessionId, sessionId),
      orderBy: (questions, { asc }) => [asc(questions.order)]
    });

    if (transcripts.length === 0 || questions.length === 0) {
      return NextResponse.json({ 
        error: 'Insufficient data for analysis', 
        transcriptsCount: transcripts.length,
        questionsCount: questions.length
      }, { status: 400 });
    }

    // Process transcripts into question-answer pairs
    const questionAnswers = processTranscripts(transcripts, questions);
    
    // Initialize AI analysis service
    const analysisService = new AIAnalysisService();
    
    // Perform analysis
    const analysis = await analysisService.analyzeInterview({
      sessionId,
      candidateName: session.candidateName || 'Candidate',
      jobTitle: session.jobTitle || 'Not specified',
      questionAnswers,
      skills: questions.map(q => q.skillTag).filter((value, index, self) => self.indexOf(value) === index)
    });

    // Save analysis results to database
    const feedbackId = uuidv4();
    await db.insert(feedbackReports).values({
      id: feedbackId,
      sessionId,
      overallScore: analysis.overallScore,
      summary: analysis.summary,
      strengths: analysis.strengths,
      areasForImprovement: analysis.areasForImprovement,
      skillAssessments: analysis.skillAssessments,
      recommendations: analysis.recommendations
    });

    // Update questions with individual scores
    for (const qa of analysis.questionAnswers) {
      await db
        .update(interviewQuestions)
        .set({ 
          score: qa.score,
          answerText: qa.answer
        })
        .where(eq(interviewQuestions.id, qa.questionId));
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Interview analysis completed',
      feedbackId
    });
  } catch (error) {
    console.error('Error analyzing interview:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze interview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Process transcripts into question-answer pairs
 */
function processTranscripts(transcripts: any[], questions: any[]) {
  const questionAnswers = [];
  
  // Group transcripts by questionId
  const transcriptsByQuestion = transcripts.reduce((acc, transcript) => {
    const questionId = transcript.questionId || 'intro';
    if (!acc[questionId]) {
      acc[questionId] = [];
    }
    acc[questionId].push(transcript);
    return acc;
  }, {});

  // Process each question
  for (const question of questions) {
    const questionTranscripts = transcriptsByQuestion[question.id] || [];
    
    // Extract assistant's question and user's answer
    const assistantTranscripts = questionTranscripts.filter(t => t.speaker === 'assistant');
    const userTranscripts = questionTranscripts.filter(t => t.speaker === 'user');
    
    // Combine all user responses for this question
    const answer = userTranscripts.map(t => t.text).join(' ');
    
    questionAnswers.push({
      questionId: question.id,
      question: question.questionText,
      questionType: question.questionType,
      skillTag: question.skillTag,
      answer: answer || 'No answer provided',
      difficulty: question.difficulty
    });
  }

  return questionAnswers;
}