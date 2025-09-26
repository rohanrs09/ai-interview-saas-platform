import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { interviewSessions, interviewQuestions, candidateProfiles, jobDescriptions, users } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/clerk'

// Helper function to validate experience level
function getValidExperienceLevel(level: string): "beginner" | "intermediate" | "advanced" {
  if (['beginner', 'intermediate', 'advanced'].includes(level)) {
    return level as "beginner" | "intermediate" | "advanced";
  }
  return 'intermediate'; // Default to intermediate if invalid
}


export async function POST(request: NextRequest) {
  try {
    // 1. Get Clerk user ID from auth
    const clerkUserId = await requireAuth();
    
    // 2. Lookup internal UUID from users table
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);
      
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const { jobId, jobTitle, jobDescription, companyName, difficulty, duration } = await request.json();
    
    let jobIdToUse = jobId;

    // If no jobId provided, create a new job
    if (!jobIdToUse) {
      if (!jobTitle || !jobDescription) {
        return NextResponse.json(
          { error: 'Job title and description are required when creating a new job' },
          { status: 400 }
        );
      }

      const [newJob] = await db
        .insert(jobDescriptions)
        .values({
          title: jobTitle,
          description: jobDescription,
          company: companyName || 'Unknown Company',
          experienceLevel: difficulty || 'intermediate',
          requiredSkills: [],
          postedById: user.id,
          estimatedTime: duration ? parseInt(duration) : 30
        })
        .returning({ id: jobDescriptions.id });
      
      jobIdToUse = newJob.id;
    }

    // Get candidate profile
    const [candidateProfile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, user.id))
      .limit(1);

    // Get job description
    const [jobDescriptionRecord] = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, jobIdToUse))
      .limit(1);

    if (!candidateProfile || !jobDescriptionRecord) {
      return NextResponse.json({ error: 'Profile or job not found' }, { status: 404 });
    }

    // Calculate skill gaps
    const candidateSkills = candidateProfile.extractedSkills || [];
    const jobSkills = jobDescriptionRecord.requiredSkills || [];
    
    const skillGaps = jobSkills.filter((skill: string) => 
      !candidateSkills.some((candidateSkill: string) => 
        candidateSkill?.toLowerCase().includes(skill?.toLowerCase()) ||
        skill?.toLowerCase().includes(candidateSkill?.toLowerCase())
      )
    );

    // Generate interview questions for skill gaps
    const questions = await aiService.generateInterviewQuestions(
      skillGaps, 
      jobDescriptionRecord.title,
      getValidExperienceLevel(jobDescriptionRecord.experienceLevel || 'intermediate')
    );

    // Create interview session
    const [session] = await db
      .insert(interviewSessions)
      .values({
        candidateId: user.id,
        jobId: jobIdToUse,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create interview questions
    const questionRecords = questions.map((q: any, index: number) => ({
      sessionId: session.id,
      skillTag: q.skill,
      questionText: q.question,
      order: index + 1,
    }));

    await db.insert(interviewQuestions).values(questionRecords);

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Error creating interview session:', error);
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Get Clerk user ID from auth
    const clerkUserId = await requireAuth();
    
    // 2. Lookup internal UUID from users table
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);
      
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')

    if (sessionId) {
      // Get specific interview session
      const [session] = await db
        .select()
        .from(interviewSessions)
        .where(and(
          eq(interviewSessions.id, sessionId),
          eq(interviewSessions.candidateId, user.id)
        ))
        .limit(1)

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // Get questions for this session
      const questions = await db
        .select()
        .from(interviewQuestions)
        .where(eq(interviewQuestions.sessionId, sessionId))
        .orderBy(interviewQuestions.order)

      return NextResponse.json({ session, questions })
    } else {
      // Get all interview sessions for user
      const sessions = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.candidateId, user.id))
        .orderBy(desc(interviewSessions.createdAt))

      return NextResponse.json({ sessions })
    }
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' }, 
      { status: 500 }
    )
  }
}
