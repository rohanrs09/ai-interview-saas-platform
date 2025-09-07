import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock data for now
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
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = mockJobs.find(j => j.id === params.id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, company, location, type, experience, skills, description, difficulty, status } = body

    // In production, update in database
    const updatedJob = {
      id: params.id,
      title: title || 'Updated Job',
      company: company || 'Updated Company',
      location: location || 'Updated Location',
      type: type || 'full-time',
      experience: experience || 'Updated Experience',
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      description: description || 'Updated description',
      difficulty: difficulty || 'intermediate',
      estimatedTime: 30,
      questionsCount: 5,
      status: status || 'active',
      applicants: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In production, delete from database
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
