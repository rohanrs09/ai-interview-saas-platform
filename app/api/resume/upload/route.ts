import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { candidateProfiles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { analyzeResume } from '@/lib/ai-service'

// Maximum allowed resume text length (characters)
const MAX_RESUME_LENGTH = 50000;

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to upload a resume' },
        { status: 401 }
      )
    }

    // Validate request body
    let resumeText: string;
    try {
      const body = await request.json()
      if (!body || typeof body.resumeText !== 'string') {
        return NextResponse.json(
          { error: 'Resume text is required and must be a string' },
          { status: 400 }
        )
      }
      resumeText = body.resumeText.trim()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with resumeText field.' },
        { status: 400 }
      )
    }

    // Validate resume text length
    if (resumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        { error: `Resume text is too long. Maximum ${MAX_RESUME_LENGTH} characters allowed.` },
        { status: 400 }
      )
    }

    if (resumeText.length < 100) {
      return NextResponse.json(
        { error: 'Resume text is too short. Please provide more details.' },
        { status: 400 }
      )
    }

    console.log(`Processing resume upload for user ${userId}, length: ${resumeText.length} chars`)

    // Analyze resume using AI service
    let analysis;
    try {
      analysis = await analyzeResume(resumeText);
      console.log('Resume analysis completed successfully', {
        skillsCount: analysis.skills?.length || 0,
        experience: analysis.experience
      });
    } catch (error) {
      console.error('Error in resume analysis:', error);
      return NextResponse.json(
        { error: 'Failed to analyze resume. Please try again.' },
        { status: 500 }
      )
    }

    const { skills = [], experience = 'Entry level', achievements = [], focusAreas = [] } = analysis;

    try {
      // Update or create candidate profile in a transaction
      await db.transaction(async (tx) => {
        const existingProfile = await tx
          .select()
          .from(candidateProfiles)
          .where(eq(candidateProfiles.userId, userId))
          .limit(1)

        const now = new Date();
        const profileData = {
          resumeText,
          extractedSkills: skills,
          experience: typeof experience === 'string' ? experience : 'Entry level',
          education: Array.isArray(focusAreas) ? focusAreas.join(', ') : '',
          updatedAt: now
        };

        if (existingProfile.length > 0) {
          // Update existing profile
          await tx
            .update(candidateProfiles)
            .set(profileData)
            .where(eq(candidateProfiles.userId, userId))
        } else {
          // Create new profile
          await tx.insert(candidateProfiles).values({
            userId,
            ...profileData,
            createdAt: now
          })
        }
      });

      return NextResponse.json({
        success: true,
        extractedSkills: skills,
        experience,
        achievements,
        focusAreas,
        message: 'Resume uploaded and analyzed successfully'
      });

    } catch (error) {
      console.error('Database error during resume upload:', error);
      return NextResponse.json(
        { error: 'Failed to save resume data. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in resume upload:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
