import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, candidateProfiles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Brain, FileText, BarChart3, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Get user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (!user) {
    redirect('/sign-in')
  }

  // Get candidate profile if user is a candidate
  let candidateProfile = null
  if (user.role === 'candidate') {
    const [profile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, user.id))
      .limit(1)
    candidateProfile = profile
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI Interview</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === 'candidate' ? 'Your Dashboard' : 'Recruiter Dashboard'}
          </h1>
          <p className="text-gray-600">
            {user.role === 'candidate' 
              ? 'Track your interview progress and improve your skills'
              : 'Manage candidates and create job postings'
            }
          </p>
        </div>

        {user.role === 'candidate' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Resume Analysis</CardTitle>
                <CardDescription>
                  Upload and analyze your resume to identify skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidateProfile?.resumeText ? (
                  <div>
                    <p className="text-sm text-green-600 mb-2">✓ Resume uploaded</p>
                    <p className="text-sm text-gray-600">
                      {candidateProfile.extractedSkills?.length || 0} skills identified
                    </p>
                  </div>
                ) : (
                  <Link href="/dashboard/resume">
                    <Button className="w-full">Upload Resume</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Mock Interviews</CardTitle>
                <CardDescription>
                  Practice with AI-generated interview questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/interviews">
                  <Button className="w-full">Start Interview</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  View your performance and improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/progress">
                  <Button variant="outline" className="w-full">View Progress</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>
                  Create and manage job descriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/jobs">
                  <Button className="w-full">Manage Jobs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Candidates</CardTitle>
                <CardDescription>
                  View and manage candidate profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/candidates">
                  <Button className="w-full">View Candidates</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Review interview results and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full">View Analytics</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
