'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Play, CheckCircle, Clock, XCircle } from 'lucide-react'

interface InterviewSession {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  totalScore?: number
  createdAt: string
  jobTitle?: string
  company?: string
}

export default function InterviewsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interviews')
      if (!response.ok) {
        throw new Error('Failed to fetch interviews')
      }
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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
              <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
              <p className="text-gray-600">Track your interview progress and performance</p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              <Plus className="mr-2 h-4 w-4" />
              Start New Interview
            </Button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Play className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-600 mb-6">
                Start your first mock interview to begin improving your skills.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                <Plus className="mr-2 h-4 w-4" />
                Start Your First Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(session.status)}
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.jobTitle || 'Mock Interview'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      {session.company && (
                        <p className="text-gray-600 mb-2">{session.company}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Created: {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                      {session.totalScore && (
                        <p className="text-sm text-gray-500">
                          Score: {session.totalScore}/100
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {session.status === 'completed' ? (
                        <Button
                          onClick={() => router.push(`/interviews/${session.id}/feedback`)}
                          variant="outline"
                        >
                          View Feedback
                        </Button>
                      ) : session.status === 'pending' ? (
                        <Button
                          onClick={() => router.push(`/interviews/${session.id}`)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Interview
                        </Button>
                      ) : session.status === 'in_progress' ? (
                        <Button
                          onClick={() => router.push(`/interviews/${session.id}`)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Continue Interview
                        </Button>
                      ) : null}
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
