import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock data for now
const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['React', 'JavaScript', 'Node.js'],
    experience: '3 years',
    lastInterview: '2024-01-15',
    averageScore: 85,
    status: 'active',
    resumeUrl: null,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    skills: ['Python', 'Django', 'PostgreSQL'],
    experience: '5 years',
    lastInterview: '2024-01-10',
    averageScore: 92,
    status: 'hired',
    resumeUrl: null,
    createdAt: '2024-01-02'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    skills: ['Vue.js', 'TypeScript', 'AWS'],
    experience: '2 years',
    lastInterview: '2024-01-08',
    averageScore: 78,
    status: 'pending',
    resumeUrl: null,
    createdAt: '2024-01-03'
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
    const status = searchParams.get('status')

    let filteredCandidates = mockCandidates

    if (search) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.status === status)
    }

    return NextResponse.json({ candidates: filteredCandidates })
  } catch (error) {
    console.error('Error fetching candidates:', error)
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
    const { name, email, skills, experience, resumeUrl } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // In production, save to database
    const newCandidate = {
      id: Date.now().toString(),
      name,
      email,
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      experience: experience || 'Not specified',
      lastInterview: null,
      averageScore: 0,
      status: 'active',
      resumeUrl,
      createdAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({ candidate: newCandidate }, { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
