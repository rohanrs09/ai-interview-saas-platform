'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  id: string
  name: string
  email: string
  position: string
  status: 'pending' | 'interviewing' | 'completed' | 'rejected'
  score?: number
  appliedDate: string
  skills: string[]
  experience: string
  avatar?: string
}

interface Job {
  id: string
  title: string
  department: string
  status: 'active' | 'paused' | 'closed'
  applicants: number
  interviews: number
  createdDate: string
  priority: 'high' | 'medium' | 'low'
}

interface RecentActivity {
  id: string
  type: 'application' | 'interview' | 'hire' | 'rejection'
  candidate: string
  position: string
  timestamp: string
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Mock data for recruiter dashboard
    setCandidates([
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        position: 'Senior Frontend Developer',
        status: 'interviewing',
        score: 85,
        appliedDate: '2024-01-15',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: '5 years'
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        position: 'Full Stack Developer',
        status: 'completed',
        score: 92,
        appliedDate: '2024-01-12',
        skills: ['Python', 'Django', 'PostgreSQL'],
        experience: '4 years'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        position: 'DevOps Engineer',
        status: 'pending',
        appliedDate: '2024-01-18',
        skills: ['AWS', 'Docker', 'Kubernetes'],
        experience: '6 years'
      },
      {
        id: '4',
        name: 'David Kim',
        email: 'david.kim@email.com',
        position: 'Backend Developer',
        status: 'rejected',
        score: 65,
        appliedDate: '2024-01-10',
        skills: ['Java', 'Spring', 'MySQL'],
        experience: '3 years'
      }
    ])

    setJobs([
      {
        id: '1',
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        status: 'active',
        applicants: 24,
        interviews: 8,
        createdDate: '2024-01-01',
        priority: 'high'
      },
      {
        id: '2',
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        status: 'active',
        applicants: 15,
        interviews: 5,
        createdDate: '2024-01-05',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Product Manager',
        department: 'Product',
        status: 'paused',
        applicants: 32,
        interviews: 12,
        createdDate: '2023-12-20',
        priority: 'low'
      }
    ])

    setRecentActivity([
      {
        id: '1',
        type: 'application',
        candidate: 'Emily Rodriguez',
        position: 'DevOps Engineer',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'interview',
        candidate: 'Sarah Johnson',
        position: 'Senior Frontend Developer',
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        type: 'hire',
        candidate: 'Michael Chen',
        position: 'Full Stack Developer',
        timestamp: '1 day ago'
      }
    ])

    setLoading(false)
  }, [])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'interviewing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'interviewing': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-600">
            Manage candidates, track interviews, and analyze recruitment performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(job => job.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviews Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => c.status === 'interviewing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {candidates.filter(c => new Date(c.appliedDate).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Candidates */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Candidates</CardTitle>
                    <CardDescription>
                      Latest candidate applications and interview progress
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/candidates">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {/* Search and Filter */}
                <div className="flex space-x-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={`${getStatusColor(candidate.status)} border-0`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(candidate.status)}
                              <span className="capitalize">{candidate.status}</span>
                            </div>
                          </Badge>
                          {candidate.score && (
                            <span className="text-sm text-gray-600">
                              Score: {candidate.score}%
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {candidate.experience} experience
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Jobs */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Active Jobs</CardTitle>
                  <Link href="/dashboard/jobs">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Job
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.filter(job => job.status === 'active').map((job) => (
                    <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                        <Badge className={`${getPriorityColor(job.priority)} border-0 text-xs`}>
                          {job.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{job.department}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{job.applicants} applicants</span>
                        <span>{job.interviews} interviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        activity.type === 'application' ? 'bg-blue-100' :
                        activity.type === 'interview' ? 'bg-yellow-100' :
                        activity.type === 'hire' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {activity.type === 'application' && <Users className="h-3 w-3 text-blue-600" />}
                        {activity.type === 'interview' && <Calendar className="h-3 w-3 text-yellow-600" />}
                        {activity.type === 'hire' && <CheckCircle className="h-3 w-3 text-green-600" />}
                        {activity.type === 'rejection' && <XCircle className="h-3 w-3 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.candidate}</span>
                          {activity.type === 'application' && ' applied for '}
                          {activity.type === 'interview' && ' interviewed for '}
                          {activity.type === 'hire' && ' was hired for '}
                          {activity.type === 'rejection' && ' was rejected for '}
                          <span className="font-medium">{activity.position}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/jobs" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </Link>
                <Link href="/dashboard/candidates" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Candidates
                  </Button>
                </Link>
                <Link href="/dashboard/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
