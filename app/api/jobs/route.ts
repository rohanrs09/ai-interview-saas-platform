import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { jobDescriptions } from '@/lib/schema'
import { eq, ilike, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const difficulty = searchParams.get('difficulty')
    const isActive = searchParams.get('status') !== 'inactive'

    // Build query conditions
    let whereConditions = []
    
    if (search) {
      whereConditions.push(
        or(
          ilike(jobDescriptions.title, `%${search}%`),
          ilike(jobDescriptions.company, `%${search}%`)
        )
      )
    }

    if (difficulty && difficulty !== 'all') {
      whereConditions.push(eq(jobDescriptions.difficulty, difficulty as any))
    }

    whereConditions.push(eq(jobDescriptions.isActive, isActive))

    // Fetch jobs from database
    const jobs = await db
      .select()
      .from(jobDescriptions)
      .where(whereConditions.length > 0 ? whereConditions.reduce((acc, condition) => acc && condition) : undefined)

    return NextResponse.json({ 
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.jobType,
        experience: job.experience,
        skills: job.requiredSkills || [],
        description: job.description,
        difficulty: job.difficulty,
        estimatedTime: job.estimatedTime,
        questionsCount: job.questionsCount,
        status: job.isActive ? 'active' : 'inactive',
        applicants: job.applicants,
        createdAt: job.createdAt.toISOString().split('T')[0]
      }))
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, company, location, type, experience, skills, description, difficulty } = body

    if (!title || !company || !location || !type || !experience || !skills || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to database
    const [newJob] = await db
      .insert(jobDescriptions)
      .values({
        title,
        company,
        location,
        jobType: type,
        experience,
        requiredSkills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        description,
        difficulty: difficulty || 'intermediate',
        estimatedTime: 30,
        questionsCount: 5,
        createdBy: userId,
        isActive: false // Start as draft
      })
      .returning()

    return NextResponse.json({ 
      job: {
        id: newJob.id,
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        type: newJob.jobType,
        experience: newJob.experience,
        skills: newJob.requiredSkills || [],
        description: newJob.description,
        difficulty: newJob.difficulty,
        estimatedTime: newJob.estimatedTime,
        questionsCount: newJob.questionsCount,
        status: newJob.isActive ? 'active' : 'draft',
        applicants: newJob.applicants,
        createdAt: newJob.createdAt.toISOString().split('T')[0]
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
