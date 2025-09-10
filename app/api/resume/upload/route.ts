import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { candidateProfiles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { analyzeResume } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    // Analyze resume using AI service
    const analysis = await analyzeResume(resumeText)
    const { skills, experience, achievements, focusAreas } = analysis

    // Update or create candidate profile
    const existingProfile = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1)

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(candidateProfiles)
        .set({
          resumeText,
          extractedSkills: skills,
          experience: experience || 'Entry level',
          education: focusAreas.join(', '),
          updatedAt: new Date()
        })
        .where(eq(candidateProfiles.userId, userId))
    } else {
      // Create new profile
      await db.insert(candidateProfiles).values({
        userId,
        resumeText,
        extractedSkills: skills,
        experience: experience || 'Entry level',
        education: focusAreas.join(', '),
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      extractedSkills: skills,
      experience,
      achievements,
      focusAreas,
      message: 'Resume uploaded and analyzed successfully'
    })

  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
