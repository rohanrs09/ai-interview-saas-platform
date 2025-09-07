import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateSkills, jobSkills } = await request.json()
    
    if (!candidateSkills || !jobSkills) {
      return NextResponse.json({ error: 'Both candidate and job skills are required' }, { status: 400 })
    }

    // Find skill gaps
    const skillGaps = jobSkills.filter((skill: string) => 
      !candidateSkills.some((candidateSkill: string) => 
        candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(candidateSkill.toLowerCase())
      )
    )

    // Find matching skills
    const matchingSkills = jobSkills.filter((skill: string) => 
      candidateSkills.some((candidateSkill: string) => 
        candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(candidateSkill.toLowerCase())
      )
    )

    return NextResponse.json({
      skillGaps,
      matchingSkills,
      gapPercentage: Math.round((skillGaps.length / jobSkills.length) * 100),
      matchPercentage: Math.round((matchingSkills.length / jobSkills.length) * 100),
    })
  } catch (error) {
    console.error('Error matching skills:', error)
    return NextResponse.json(
      { error: 'Failed to match skills' }, 
      { status: 500 }
    )
  }
}
