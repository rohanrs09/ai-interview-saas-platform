'use client'

import { redirect } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, FileText, BarChart3, TrendingUp, Users, Briefcase, ArrowRight, Target, Calendar, Clock, CheckCircle, Play, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter'>('candidate')
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    avgScore: 0,
    totalJobs: 0,
    totalCandidates: 0,
    activeInterviews: 0,
    pendingInterviews: 0,
    improvement: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      
      try {
        // Determine user role
        const role = user.publicMetadata?.role as 'candidate' | 'recruiter'
        if (role) {
          setUserRole(role)
        } else {
          const email = user.emailAddresses[0]?.emailAddress || ''
          const isRecruiter = email.includes('@company.com') || 
                            email.includes('@hr.') || 
                            email.includes('recruiter')
          setUserRole(isRecruiter ? 'recruiter' : 'candidate')
        }

        // Fetch stats based on role
        const endpoint = userRole === 'recruiter' ? '/api/analytics/recruiter' : '/api/analytics/candidate'
        const [statsRes, activityRes, interviewsRes] = await Promise.all([
          fetch(endpoint),
          fetch('/api/analytics'),
          fetch('/api/interviews')
        ])
        
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats({
            totalInterviews: data.totalInterviews || 12,
            completedInterviews: data.completedInterviews || 8,
            avgScore: data.avgScore || 85,
            totalJobs: data.totalJobs || 5,
            totalCandidates: data.totalCandidates || 48,
            activeInterviews: data.activeInterviews || 3,
            pendingInterviews: data.pendingInterviews || 2,
            improvement: data.improvement || 15
          })
        }
        
        if (activityRes.ok) {
          const data = await activityRes.json()
          setRecentActivity(data.recentActivity || [])
        }
        
        if (interviewsRes.ok) {
          const data = await interviewsRes.json()
          setUpcomingInterviews(data.interviews?.slice(0, 3) || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchDashboardData()
    }
  }, [user, isLoaded])

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-lg text-gray-600">
          {userRole === 'candidate' 
            ? 'Your interview preparation dashboard - track progress and improve skills' 
            : 'Your recruitment dashboard - manage candidates and job postings'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Ready to {userRole === 'candidate' ? 'practice' : 'recruit'}?</h2>
                <p className="text-indigo-100">
                  {userRole === 'candidate' 
                    ? 'Start a mock interview session and improve your skills'
                    : 'Create a new job posting or review candidate profiles'}
                </p>
              </div>
              <div className="flex gap-3">
                {userRole === 'candidate' ? (
                  <>
                    <Link href="/interviews">
                      <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                        <Play className="h-5 w-5 mr-2" />
                        Start Interview
                      </Button>
                    </Link>
                    <Link href="/dashboard/resume">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <FileText className="h-5 w-5 mr-2" />
                        Upload Resume
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/jobs">
                      <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Post Job
                      </Button>
                    </Link>
                    <Link href="/dashboard/candidates">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <Users className="h-5 w-5 mr-2" />
                        View Candidates
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
                <p className="text-xs text-green-600 mt-1">+{stats.pendingInterviews} pending</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedInterviews}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.totalInterviews > 0 ? Math.round((stats.completedInterviews/stats.totalInterviews)*100) : 0}% completion</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
                <p className="text-xs text-green-600 mt-1">+{stats.improvement}% improvement</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {userRole === 'candidate' ? 'Active Sessions' : 'Total Jobs'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {userRole === 'candidate' ? stats.activeInterviews : stats.totalJobs}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {userRole === 'candidate' ? 'In progress' : `${stats.totalCandidates} candidates`}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                {userRole === 'candidate' ? (
                  <Clock className="h-8 w-8 text-blue-600" />
                ) : (
                  <Briefcase className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      {userRole === 'candidate' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/dashboard/resume'}>
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/interviews'}>
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/dashboard/progress'}>
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
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/dashboard/jobs'}>
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/dashboard/candidates'}>
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => window.location.href='/dashboard/analytics'}>
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
