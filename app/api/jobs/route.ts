import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock data for now - in production, this would come from your database
const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: '5+ years',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    description: 'We are looking for a senior frontend developer with strong React and TypeScript experience...',
    difficulty: 'advanced',
    estimatedTime: 45,
    questionsCount: 8,
    status: 'active',
    applicants: 12,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'full-time',
    experience: '3+ years',
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    description: 'Join our growing team as a full stack engineer working on exciting projects...',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionsCount: 6,
    status: 'active',
    applicants: 8,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Junior React Developer',
    company: 'WebDev Inc',
    location: 'New York, NY',
    type: 'full-time',
    experience: '1+ years',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    description: 'Perfect opportunity for a junior developer to grow their React skills...',
    difficulty: 'beginner',
    estimatedTime: 20,
    questionsCount: 4,
    status: 'active',
    applicants: 15,
    createdAt: '2024-01-08'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')

    let filteredJobs = mockJobs

    if (search) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (difficulty && difficulty !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.difficulty === difficulty)
    }

    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status)
    }

    return NextResponse.json({ jobs: filteredJobs })
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

    // In production, save to database
    const newJob = {
      id: Date.now().toString(),
      title,
      company,
      location,
      type,
      experience,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean),
      description,
      difficulty: difficulty || 'intermediate',
      estimatedTime: 30, // Default
      questionsCount: 5, // Default
      status: 'draft',
      applicants: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({ job: newJob }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
