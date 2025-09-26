'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { DashboardLayout } from '@/components/dashboard-layout'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  FileText,
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface JobDescription {
  id: string
  title: string
  company: string
  department: string
  location: string
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior'
  createdAt: string
  updatedAt: string
  status: 'draft' | 'active' | 'archived'
  questionCount?: number
}

export default function JobDescriptionsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  
  // New job description state
  const [isCreating, setIsCreating] = useState(false)
  const [newJobDescription, setNewJobDescription] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    description: '',
    experienceLevel: 'mid' as const,
    status: 'draft' as const
  })
  
  // Question generation state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{
    question: string;
    skillTag: string;
  }>>([])
  
  useEffect(() => {
    fetchJobDescriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const fetchJobDescriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recruiter/job-descriptions')
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setJobDescriptions(data.jobDescriptions || [])
    } catch (error) {
      console.error('Error fetching job descriptions:', error)
      toast.error('Failed to load job descriptions', {
        description: 'Unable to fetch job descriptions. Please try again later.'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateJobDescription = async () => {
    if (!newJobDescription.title || !newJobDescription.description) {
      toast.error('Missing information', {
        description: 'Please provide a job title and description'
      })
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/recruiter/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJobDescription),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setJobDescriptions(prev => [data.jobDescription, ...prev])
      setNewJobDescription({
        title: '',
        company: '',
        department: '',
        location: '',
        description: '',
        experienceLevel: 'mid',
        status: 'draft'
      })
      toast.success('Job description created successfully')
    } catch (error) {
      console.error('Error creating job description:', error)
      toast.error('Failed to create job description')
    } finally {
      setIsCreating(false)
    }
  }
  
  const handleGenerateQuestions = async (jobId: string) => {
    setSelectedJobId(jobId)
    setIsGeneratingQuestions(true)
    setGeneratedQuestions([])
    
    try {
      const response = await fetch(`/api/recruiter/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescriptionId: jobId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      const questions = data.questions || []
      setGeneratedQuestions(questions)
      toast.success(`Generated ${questions.length} interview questions`)
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error('Failed to generate interview questions')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }
  
  const handleDeleteJobDescription = async (jobId: string) => {
    try {
      const response = await fetch(`/api/recruiter/job-descriptions/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      setJobDescriptions(prev => prev.filter(job => job.id !== jobId))
      toast.success('Job description deleted successfully')
    } catch (error) {
      console.error('Error deleting job description:', error)
      toast.error('Failed to delete job description')
    }
  }
  
  const filteredJobDescriptions = jobDescriptions.filter(job => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = job.title.toLowerCase().includes(searchTermLower) ||
                         job.company.toLowerCase().includes(searchTermLower)
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'with-questions' && job.questionCount && job.questionCount > 0) ||
                      (activeTab === 'without-questions' && (!job.questionCount || job.questionCount === 0))
    return matchesSearch && matchesFilter && matchesTab
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" aria-hidden="true"></div>
            <p className="mt-2 text-gray-600">Loading job descriptions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Descriptions</h1>
            <p className="text-gray-600">Manage job descriptions and generate interview questions</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Job Description</DialogTitle>
                  <DialogDescription>
                    Create a new job description for AI-powered question generation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJobDescription.title}
                        onChange={(e) => setNewJobDescription(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJobDescription.company}
                        onChange={(e) => setNewJobDescription(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. TechCorp Inc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newJobDescription.department}
                        onChange={(e) => setNewJobDescription(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJobDescription.location}
                        onChange={(e) => setNewJobDescription(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select 
                      value={newJobDescription.experienceLevel} 
                      onValueChange={(value: any) => setNewJobDescription(prev => ({ ...prev, experienceLevel: value }))}
                    >
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
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJobDescription.description}
                      onChange={(e) => setNewJobDescription(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Paste the full job description here including responsibilities, requirements, and qualifications..."
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Include detailed information about required skills, experience, and responsibilities for better AI question generation.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewJobDescription({
                      title: '',
                      company: '',
                      department: '',
                      location: '',
                      description: '',
                      experienceLevel: 'mid',
                      status: 'draft'
                    })}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateJobDescription} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span>Create Job Description</span>
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search job descriptions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Descriptions</TabsTrigger>
            <TabsTrigger value="with-questions">With Questions</TabsTrigger>
            <TabsTrigger value="without-questions">Needs Questions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredJobDescriptions.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No job descriptions found</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first job description to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobDescriptions.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <Badge
                          variant={job.status === 'active' ? 'default' : 
                                 job.status === 'draft' ? 'outline' : 'secondary'}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex flex-col gap-1 mt-1">
                        <span>{job.company}</span>
                        <span className="text-xs text-gray-500">{job.department} • {job.location}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {job.description}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                        </Badge>
                        
                        {job.questionCount ? (
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            {job.questionCount} Questions
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            No Questions
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="text-xs text-gray-500">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Brain className="h-3.5 w-3.5 mr-1" />
                              Generate
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Generate Interview Questions</DialogTitle>
                              <DialogDescription>
                                AI-powered question generation based on job description
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="border rounded-md p-4 bg-gray-50">
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{job.company} • {job.department}</p>
                                <Separator className="my-3" />
                                <p className="text-sm whitespace-pre-line">{job.description}</p>
                              </div>
                              
                              {isGeneratingQuestions && selectedJobId === job.id ? (
                                <div className="text-center py-8" role="status" aria-live="polite">
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" aria-hidden="true" />
                                  <p className="mt-2">Generating interview questions...</p>
                                  <p className="text-sm text-gray-500">This may take a moment</p>
                                </div>
                              ) : generatedQuestions.length > 0 && selectedJobId === job.id ? (
                                <div className="space-y-4">
                                  <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle>Questions Generated Successfully</AlertTitle>
                                    <AlertDescription>
                                      {generatedQuestions.length} questions have been created based on this job description.
                                    </AlertDescription>
                                  </Alert>
                                  
                                  <div className="border rounded-md divide-y">
                                    {generatedQuestions.map((question, index) => (
                                      <div key={index} className="p-3">
                                        <div className="flex justify-between">
                                          <span className="font-medium">Q{index + 1}:</span>
                                          <Badge variant="outline">{question.skillTag}</Badge>
                                        </div>
                                        <p className="mt-1">{question.question}</p>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Save Questions
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <Brain className="h-12 w-12 mx-auto text-indigo-400" aria-hidden="true" />
                                  <h3 className="mt-4 font-medium">Generate Interview Questions</h3>
                                  <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                    Our AI will analyze the job description and create relevant technical and behavioral questions.
                                  </p>
                                  <Button 
                                    className="mt-4" 
                                    onClick={() => handleGenerateQuestions(job.id)}
                                    aria-label={`Generate questions for ${job.title}`}
                                  >
                                    <Brain className="h-4 w-4 mr-2" aria-hidden="true" />
                                    Generate Questions
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteJobDescription(job.id)}
                          aria-label={`Delete ${job.title} job description`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}