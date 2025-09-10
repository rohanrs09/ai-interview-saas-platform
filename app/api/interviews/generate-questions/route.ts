import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { candidateProfiles, jobDescriptions } from '@/lib/schema'
import { generateInterviewQuestions } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobTitle, jobDescription, skills, difficulty = 'intermediate', resumeText, count = 5 } = body

    // Generate questions using AI service
    const questions = await generateInterviewQuestions({
      jobTitle: jobTitle || 'Software Developer',
      jobDescription,
      skills: skills || [],
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      count,
      resumeText
    })

    return NextResponse.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      jobTitle: jobTitle || 'Software Developer'
    })

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
