'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, TrendingUp, Target, Lightbulb, CheckCircle, XCircle } from 'lucide-react'

interface FeedbackReport {
  id: string
  summary: string
  strengths: string
  weaknesses: string
  ratedSkills: Record<string, number>
  overallScore: number
  recommendations: string
}

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [params.id])

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/interviews/${params.id}/feedback`)
      if (!response.ok) {
        throw new Error('Failed to fetch feedback')
      }
      const data = await response.json()
      setFeedback(data.feedback)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback...</p>
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

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Feedback Not Available</CardTitle>
            <CardDescription>
              The feedback for this interview is not available yet.
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
              <p className="text-gray-600">Detailed analysis of your performance</p>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(feedback.overallScore)}`}>
                {feedback.overallScore}
              </div>
              <div className="text-2xl text-gray-600 mb-4">/ 100</div>
              <div className={`text-lg font-medium ${getScoreColor(feedback.overallScore)}`}>
                {getScoreLabel(feedback.overallScore)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{feedback.strengths}</p>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="mr-2 h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{feedback.weaknesses}</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Ratings */}
        {Object.keys(feedback.ratedSkills).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Skill Ratings
              </CardTitle>
              <CardDescription>
                Performance breakdown by skill area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(feedback.ratedSkills).map(([skill, score]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{skill}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 80 ? 'bg-green-500' : 
                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`font-medium w-12 text-right ${getScoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{feedback.summary}</p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{feedback.recommendations}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button onClick={() => router.push('/interviews')} size="lg">
            Take Another Interview
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg">
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
