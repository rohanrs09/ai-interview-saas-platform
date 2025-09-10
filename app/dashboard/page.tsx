'use client'

import { redirect } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, BarChart3, Briefcase, Brain, Users } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter'>('candidate')
  const [loading, setLoading] = useState(true)

  if (!isLoaded || !user) {
    redirect('/sign-in')
  }

  useEffect(() => {
    // TODO: Fetch user role from database
    // For now, determine role based on email domain or user metadata
    const fetchUserRole = async () => {
      try {
        // Check if user has role in metadata
        const role = user.publicMetadata?.role as 'candidate' | 'recruiter'
        if (role) {
          setUserRole(role)
        } else {
          // Default logic: check email domain or other criteria
          const email = user.emailAddresses[0]?.emailAddress || ''
          const isRecruiter = email.includes('@company.com') || email.includes('@hr.') || 
                            user.firstName?.toLowerCase().includes('recruiter') ||
                            user.lastName?.toLowerCase().includes('recruiter')
          setUserRole(isRecruiter ? 'recruiter' : 'candidate')
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setUserRole('candidate') // Default to candidate
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          {userRole === 'candidate' 
            ? 'Ready to practice your interview skills and advance your career?' 
            : 'Manage your recruitment process and find the best candidates'
          }
        </p>
      </div>

      {userRole === 'candidate' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-blue-600 mb-4" />
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

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
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

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
    </DashboardLayout>
  )
}
