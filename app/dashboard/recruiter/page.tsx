'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Users,
  Briefcase,
  TrendingUp,
  Brain,
  FileText,
  Clock,
  Star,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface Job {
  id: string
  title: string
  company: string
  department: string
  location: string
  status: 'active' | 'paused' | 'closed'
  type: 'full-time' | 'part-time' | 'contract'
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior'
  candidates: number
  createdAt: string
}

interface Candidate {
  id: string
  name: string
  email: string
  jobTitle: string
  status: 'pending' | 'interviewed' | 'hired' | 'rejected'
  score?: number
  interviewDate?: string
  skills: string[]
  experience: number
  location: string
}

interface Analytics {
  totalJobs: number
  activeJobs: number
  totalCandidates: number
  interviewed: number
  hired: number
  avgScore: number
  topSkills: Array<{ skill: string; demand: number }>
  recentActivity: Array<{
    type: 'job_created' | 'candidate_applied' | 'interview_completed'
    message: string
    timestamp: string
  }>
}

export default function RecruiterDashboard() {
  const { user } = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isUploadingJob, setIsUploadingJob] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    type: 'full-time' as const,
    description: '',
    experienceLevel: 'mid' as const
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch jobs
        const jobsResponse = await fetch('/api/recruiter/jobs')
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setJobs(jobsData.jobs || [])
        }

        // Fetch candidates
        const candidatesResponse = await fetch('/api/recruiter/candidates')
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json()
          setCandidates(candidatesData.candidates || [])
        }

        // Generate analytics from data
        const totalJobs = jobs.length
        const activeJobs = jobs.filter(j => j.status === 'active').length
        const totalCandidates = candidates.length
        const interviewed = candidates.filter(c => c.status === 'interviewed').length
        const hired = candidates.filter(c => c.status === 'hired').length
        const scores = candidates.filter(c => c.score).map(c => c.score!)
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

        setAnalytics({
          totalJobs,
          activeJobs,
          totalCandidates,
          interviewed,
          hired,
          avgScore,
          topSkills: [
            { skill: 'JavaScript', demand: 85 },
            { skill: 'React', demand: 78 },
            { skill: 'Python', demand: 72 },
            { skill: 'Node.js', demand: 65 },
            { skill: 'TypeScript', demand: 60 }
          ],
          recentActivity: [
            { type: 'interview_completed', message: 'John Doe completed interview for Frontend Developer', timestamp: '2 hours ago' },
            { type: 'candidate_applied', message: 'Sarah Smith applied for Backend Engineer', timestamp: '4 hours ago' },
            { type: 'job_created', message: 'New job posted: Full Stack Developer', timestamp: '1 day ago' }
          ]
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleJobUpload = async () => {
    if (!newJob.title || !newJob.description) return

    setIsUploadingJob(true)
    try {
      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newJob,
          status: 'active'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(prev => [data.job, ...prev])
        setNewJob({
          title: '',
          company: '',
          department: '',
          location: '',
          type: 'full-time',
          description: '',
          experienceLevel: 'mid'
        })
      }
    } catch (error) {
      console.error('Error creating job:', error)
    } finally {
      setIsUploadingJob(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading recruiter dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-600">Manage jobs, candidates, and track hiring analytics</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Post New Job</DialogTitle>
                  <DialogDescription>
                    Create a new job posting with AI-powered question generation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. TechCorp Inc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newJob.department}
                        onChange={(e) => setNewJob(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Job Type</Label>
                      <Select value={newJob.type} onValueChange={(value: any) => setNewJob(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select value={newJob.experienceLevel} onValueChange={(value: any) => setNewJob(prev => ({ ...prev, experienceLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleJobUpload} disabled={isUploadingJob}>
                      {isUploadingJob ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Create Job
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics?.totalJobs || 0}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Candidates</p>
                    <p className="text-2xl font-bold text-green-900">{analytics?.totalCandidates || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Interviewed</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics?.interviewed || 0}</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Avg. Score</p>
                    <p className="text-2xl font-bold text-orange-900">{analytics?.avgScore || 0}%</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Top Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your hiring pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'job_created' ? 'bg-blue-100' :
                        activity.type === 'candidate_applied' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'job_created' ? <Briefcase className="h-4 w-4 text-blue-600" /> :
                         activity.type === 'candidate_applied' ? <Users className="h-4 w-4 text-green-600" /> :
                         <Brain className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Skills in Demand</CardTitle>
                <CardDescription>Most requested skills across your job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topSkills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-sm text-gray-600">{skill.demand}%</span>
                      </div>
                      <Progress value={skill.demand} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs List */}
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant={job.status === 'active' ? 'default' : job.status === 'paused' ? 'secondary' : 'outline'}>
                          {job.status}
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{job.company} • {job.department}</p>
                      <p className="text-sm text-gray-500 mb-3">{job.location}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.candidates || 0} candidates
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {job.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Candidates List */}
          <div className="grid gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                        <Badge variant={
                          candidate.status === 'hired' ? 'default' :
                          candidate.status === 'interviewed' ? 'secondary' :
                          candidate.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {candidate.status}
                        </Badge>
                        {candidate.score && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {candidate.score}% Score
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{candidate.email}</p>
                      <p className="text-sm text-gray-500 mb-3">Applied for: {candidate.jobTitle}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{candidate.experience} years experience</span>
                        <span>{candidate.location}</span>
                        {candidate.interviewDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {candidate.interviewDate}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{candidate.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hiring Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel</CardTitle>
                <CardDescription>Track candidates through your hiring process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Applied', count: analytics?.totalCandidates || 0, color: 'bg-blue-500' },
                    { stage: 'Interviewed', count: analytics?.interviewed || 0, color: 'bg-purple-500' },
                    { stage: 'Hired', count: analytics?.hired || 0, color: 'bg-green-500' }
                  ].map((stage, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${stage.color}`}></div>
                      <span className="flex-1 font-medium">{stage.stage}</span>
                      <span className="font-bold">{stage.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key hiring performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Interview to Hire Rate</span>
                    <span className="font-bold">
                      {analytics?.interviewed && analytics?.hired 
                        ? Math.round((analytics.hired / analytics.interviewed) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Interview Score</span>
                    <span className="font-bold">{analytics?.avgScore || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Job Postings</span>
                    <span className="font-bold">{analytics?.activeJobs || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time to Hire (Avg)</span>
                    <span className="font-bold">14 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
