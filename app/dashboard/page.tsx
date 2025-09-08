import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Brain, FileText, BarChart3, Clock, User, LogOut } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  
  
  if (!userId || !user) {
    redirect('/sign-in')
  }

  // Determine user role - for now, default to candidate
  // In a real app, you'd check this from your database
  const userRole = 'candidate' as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'candidate' ? 'Your Dashboard' : 'Recruiter Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'candidate' 
              ? 'Track your interview progress and improve your skills'
              : 'Manage candidates and create job postings'
            }
          </p>
        </div>

        {userRole === 'candidate' ? (
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
                <Link href="/dashboard/resume">
                  <Button className="w-full">Upload Resume</Button>
                </Link>
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
