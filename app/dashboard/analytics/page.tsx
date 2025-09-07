'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Briefcase, Award, Calendar, BarChart3, PieChart, Download } from 'lucide-react'

interface AnalyticsData {
  totalCandidates: number
  totalJobs: number
  totalInterviews: number
  averageScore: number
  completionRate: number
  topSkills: Array<{ skill: string; count: number }>
  monthlyStats: Array<{ month: string; interviews: number; score: number }>
  jobStats: Array<{ title: string; applicants: number; avgScore: number }>
  recentActivity: Array<{ type: string; description: string; timestamp: string }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    // Mock data for now
    setAnalytics({
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
    })
    setLoading(false)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interview': return <Award className="h-4 w-4 text-green-600" />
      case 'application': return <Users className="h-4 w-4 text-blue-600" />
      case 'job': return <Briefcase className="h-4 w-4 text-purple-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-green-100 text-green-800'
      case 'application': return 'bg-blue-100 text-blue-800'
      case 'job': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Insights and performance metrics for your recruitment process
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviews Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalInterviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Interview Performance Over Time
              </CardTitle>
              <CardDescription>
                Monthly interview completion and average scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics?.monthlyStats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-8 bg-blue-200 rounded-t" style={{ height: `${(stat.interviews / 40) * 200}px` }}></div>
                    <div className="text-xs text-gray-600">{stat.month}</div>
                    <div className="text-xs font-medium">{stat.interviews}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Top Skills
              </CardTitle>
              <CardDescription>
                Most common skills among candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(skill.count / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{skill.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>
                Interview results by job position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.jobStats.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.applicants} applicants</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{job.avgScore}%</div>
                      <div className="text-xs text-gray-600">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{analytics?.completionRate}%</div>
              <div className="text-sm text-gray-600">Interview Completion Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics ? Math.round(analytics.totalInterviews / analytics.totalJobs) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Interviews per Job</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analytics ? Math.round(analytics.totalCandidates / analytics.totalJobs) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Candidates per Job</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
