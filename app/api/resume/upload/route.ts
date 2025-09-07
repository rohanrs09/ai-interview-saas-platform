import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { candidateProfiles } from '@/lib/schema'
import { aiService } from '@/lib/ai'
import { eq } from 'drizzle-orm'

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

    // Extract skills using AI
    const extractedSkills = await aiService.extractSkillsFromResume(resumeText)

    // Save or update candidate profile
    const existingProfile = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1)

    if (existingProfile.length > 0) {
      await db
        .update(candidateProfiles)
        .set({
          resumeText,
          extractedSkills,
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.userId, userId))
    } else {
      await db.insert(candidateProfiles).values({
        userId,
        resumeText,
        extractedSkills,
      })
    }

    return NextResponse.json({ 
      success: true, 
      extractedSkills 
    })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Failed to process resume' }, 
      { status: 500 }
    )
  }
}
