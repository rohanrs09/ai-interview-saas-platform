'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Building, MapPin, DollarSign, Users } from 'lucide-react'

interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  location?: string
  salaryRange?: string
  isActive: boolean
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salaryRange: '',
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      // In a real app, this would fetch from the API
      setJobs([])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // In a real app, this would submit to the API
      console.log('Creating job:', formData)
      setShowCreateForm(false)
      setFormData({
        title: '',
        company: '',
        description: '',
        location: '',
        salaryRange: '',
      })
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
              <p className="text-gray-600">Create and manage job descriptions for interviews</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job Posting
            </Button>
          </div>
        </div>

        {/* Create Job Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Job Posting</CardTitle>
              <CardDescription>
                Fill out the details for the job position you want to create interviews for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., Tech Corp"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <Input
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="e.g., $80,000 - $120,000"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Job Posting
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first job posting to start conducting interviews.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job Posting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.isActive 
                            ? 'text-green-600 bg-green-50 border border-green-200' 
                            : 'text-gray-600 bg-gray-50 border border-gray-200'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                        )}
                        {job.salaryRange && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salaryRange}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {job.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Candidates
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
