'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Brain, Clock, Target, Play, Search, Filter, Plus, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/dashboard-layout'

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
  const router = useRouter()
  const { user } = useUser()
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    companyName: '',
    experience: 'entry',
    difficulty: 'medium',
    duration: '30'
  })

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interviews')
        if (response.ok) {
          const data = await response.json()
          setInterviews(data.interviews || [])
        } else {
          // Use mock data if API fails
          setInterviews([
            {
              id: '1',
              title: 'Frontend Developer',
              company: 'Tech Corp',
              difficulty: 'medium',
              duration: 30,
              questions: 10,
              status: 'available'
            },
            {
              id: '2',
              title: 'Backend Engineer',
              company: 'StartupXYZ',
              difficulty: 'hard',
              duration: 45,
              questions: 15,
              status: 'available'
            },
            {
              id: '3',
              title: 'Full Stack Developer',
              company: 'Innovation Labs',
              difficulty: 'medium',
              duration: 40,
              questions: 12,
              status: 'completed'
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching interviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const handleCreateInterview = async () => {
    try {
      const response = await fetch('/api/interviews/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          jobDescription: formData.jobDescription,
          companyName: formData.companyName,
          experience: formData.experience,
          difficulty: formData.difficulty,
          duration: parseInt(formData.duration)
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/interviews/${data.sessionId}`)
      } else {
        console.error('Failed to create interview session')
      }
    } catch (error) {
      console.error('Error creating interview:', error)
    }
  }

  const startInterview = async (interviewId: string) => {
    try {
      const response = await fetch('/api/interviews/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: interviewId,
          jobTitle: interviews.find(i => i.id === interviewId)?.title || 'General Interview',
          difficulty: interviews.find(i => i.id === interviewId)?.difficulty || 'medium'
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/interviews/${data.sessionId}`)
      } else {
        // Fallback to direct navigation
        router.push(`/interviews/${interviewId}`)
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      router.push(`/interviews/${interviewId}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Mock Interviews</h1>
            <p className="text-gray-600">
              Practice with AI-powered interviews tailored to your skills
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Interview</DialogTitle>
                <DialogDescription>
                  Set up a personalized mock interview based on your target job
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. Tech Corp"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <Textarea
                    value={formData.jobDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    placeholder="Paste the job description here..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
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
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (min)</label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateInterview} disabled={!formData.jobTitle}>
                    Start Interview
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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
                  variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('all')}
                >
                  All Levels
                </Button>
                <Button
                  variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('beginner')}
                >
                  Beginner
                </Button>
                <Button
                  variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('intermediate')}
                >
                  Intermediate
                </Button>
                <Button
                  variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
                  onClick={() => setDifficultyFilter('advanced')}
                >
                  Advanced
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading interviews...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.length > 0 ? (
            interviews
              .filter(interview => {
                const matchesSearch = interview.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     interview.company?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesDifficulty = difficultyFilter === 'all' || 
                                         interview.difficulty === difficultyFilter ||
                                         (difficultyFilter === 'beginner' && interview.difficulty === 'easy') ||
                                         (difficultyFilter === 'intermediate' && interview.difficulty === 'medium') ||
                                         (difficultyFilter === 'advanced' && interview.difficulty === 'hard')
                return matchesSearch && matchesDifficulty
              })
              .map((interview) => (
                <Card key={interview.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{interview.title}</CardTitle>
                      <Badge 
                        className={
                          interview.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          interview.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{interview.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{interview.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="h-4 w-4" />
                        <span>{interview.questions} questions</span>
                      </div>
                      {interview.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      )}
                      <Button 
                        className="w-full mt-4"
                        onClick={() => startInterview(interview.id)}
                        disabled={interview.status === 'completed'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {interview.status === 'completed' ? 'Review' : 'Start Interview'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="col-span-full bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or create a custom interview</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Interview
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}