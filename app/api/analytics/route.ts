import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Mock analytics data
    const analytics = {
      totalCandidates: 156,
      totalJobs: 12,
      totalInterviews: 89,
      averageScore: 82,
      completionRate: 94,
      topSkills: [
        { skill: 'React', count: 45 },
        { skill: 'JavaScript', count: 38 },
        { skill: 'Python', count: 32 },
        { skill: 'Node.js', count: 28 },
        { skill: 'AWS', count: 25 }
      ],
      monthlyStats: [
        { month: 'Jan', interviews: 23, score: 78 },
        { month: 'Feb', interviews: 31, score: 82 },
        { month: 'Mar', interviews: 28, score: 85 },
        { month: 'Apr', interviews: 35, score: 88 }
      ],
      jobStats: [
        { title: 'Senior Frontend Developer', applicants: 24, avgScore: 87 },
        { title: 'Full Stack Engineer', applicants: 18, avgScore: 83 },
        { title: 'DevOps Engineer', applicants: 12, avgScore: 79 },
        { title: 'Data Scientist', applicants: 15, avgScore: 91 }
      ],
      recentActivity: [
        { type: 'interview', description: 'John Doe completed Frontend Developer interview', timestamp: '2 hours ago' },
        { type: 'application', description: 'New application for Full Stack Engineer position', timestamp: '4 hours ago' },
        { type: 'interview', description: 'Jane Smith completed Data Scientist interview', timestamp: '6 hours ago' },
        { type: 'job', description: 'New job posting: Backend Developer', timestamp: '1 day ago' }
      ]
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
