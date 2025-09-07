'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Play, Clock, Award, Users, MapPin, Briefcase } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  experience: string
  skills: string[]
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  questionsCount: number
}

interface InterviewSession {
  id: string
  jobId: string
  jobTitle: string
  status: 'completed' | 'in-progress' | 'not-started'
  score?: number
  completedAt?: string
  createdAt: string
}

export default function InterviewsPage() {
  const { user } = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setJobs([
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
        questionsCount: 8
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
        questionsCount: 6
      },
      {
        id: '3',
        title: 'Junior React Developer',
        company: 'WebDev Inc',
        location: 'New York, NY',
        type: 'full-time',
        experience: '1+ years',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        description: 'Perfect opportunity for a junior developer to grow their React skills...',
        difficulty: 'beginner',
        estimatedTime: 20,
        questionsCount: 4
      },
      {
        id: '4',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'Austin, TX',
        type: 'contract',
        experience: '4+ years',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        description: 'Looking for an experienced DevOps engineer to manage our cloud infrastructure...',
        difficulty: 'advanced',
        estimatedTime: 50,
        questionsCount: 10
      }
    ])

    setSessions([
      {
        id: '1',
        jobId: '1',
        jobTitle: 'Senior Frontend Developer',
        status: 'completed',
        score: 85,
        completedAt: '2024-01-15',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        jobId: '2',
        jobTitle: 'Full Stack Engineer',
        status: 'in-progress',
        createdAt: '2024-01-16'
      }
    ])

    setLoading(false)
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDifficulty = filterDifficulty === 'all' || job.difficulty === filterDifficulty
    
    return matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800'
      case 'part-time': return 'bg-purple-100 text-purple-800'
      case 'contract': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSessionStatus = (jobId: string) => {
    const session = sessions.find(s => s.jobId === jobId)
    if (!session) return 'not-started'
    return session.status
  }

  const getSessionScore = (jobId: string) => {
    const session = sessions.find(s => s.jobId === jobId)
    return session?.score
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Interviews</h1>
          <p className="text-gray-600">
            Practice with AI-generated interview questions tailored to specific job positions
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterDifficulty === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('all')}
                >
                  All Levels
                </Button>
                <Button
                  variant={filterDifficulty === 'beginner' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('beginner')}
                >
                  Beginner
                </Button>
                <Button
                  variant={filterDifficulty === 'intermediate' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('intermediate')}
                >
                  Intermediate
                </Button>
                <Button
                  variant={filterDifficulty === 'advanced' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('advanced')}
                >
                  Advanced
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const sessionStatus = getSessionStatus(job.id)
              const sessionScore = getSessionScore(job.id)
              
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                        <CardDescription className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getDifficultyColor(job.difficulty)}>
                          {job.difficulty}
                        </Badge>
                        <Badge className={getTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      {job.experience}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.estimatedTime} min
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        {job.questionsCount} questions
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    {sessionStatus === 'completed' && sessionScore && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Completed</span>
                          <span className="text-lg font-bold text-green-600">{sessionScore}%</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Great job! You can retake this interview anytime.
                        </p>
                      </div>
                    )}
                    
                    {sessionStatus === 'in-progress' && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">In Progress</span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Continue where you left off.
                        </p>
                      </div>
                    )}
                    
                    <Link href={`/interviews/${job.id}`}>
                      <Button className="w-full">
                        {sessionStatus === 'completed' ? 'Retake Interview' : 
                         sessionStatus === 'in-progress' ? 'Continue Interview' : 'Start Interview'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No job postings available at the moment'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
              <div className="text-sm text-gray-600">Available Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.filter(s => s.score).length) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}