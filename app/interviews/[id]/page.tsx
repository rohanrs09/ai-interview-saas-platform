'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InterviewInterface } from '@/components/interview-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'

interface Question {
  id: number
  skill: string
  question: string
}

interface InterviewSession {
  id: string
  status: string
  totalScore?: number
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviewData()
  }, [params.id])

  const fetchInterviewData = async () => {
    try {
      const response = await fetch(`/api/interviews?sessionId=${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch interview data')
      }
      const data = await response.json()
      setSession(data.session)
      setQuestions(data.questions.map((q: any, index: number) => ({
        id: q.id,
        skill: q.skillTag,
        question: q.questionText,
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (questionId: number, answer: string) => {
    try {
      const response = await fetch(`/api/interviews/${params.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/interviews/${params.id}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to complete interview')
      }

      const data = await response.json()
      router.push(`/interviews/${params.id}/feedback`)
    } catch (err) {
      console.error('Error completing interview:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview...</p>
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>
              The interview session you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Interview Completed</CardTitle>
            <CardDescription>
              This interview has already been completed. You can view your feedback below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.totalScore && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {session.totalScore}/100
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            )}
            <Button 
              onClick={() => router.push(`/interviews/${params.id}/feedback`)} 
              className="w-full"
            >
              View Feedback
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="outline" 
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <InterviewInterface
      questions={questions}
      onAnswerSubmit={handleAnswerSubmit}
      onComplete={handleComplete}
    />
  )
}
