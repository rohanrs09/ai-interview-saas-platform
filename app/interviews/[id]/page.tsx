'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { VoiceInterview } from '@/components/voice-interview'
import { Brain, Clock, Award, ArrowLeft, Mic, FileText, BarChart3 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import type { VapiTranscript } from '@/lib/vapi'

interface InterviewSession {
  id: string
  jobTitle: string
  jobDescription?: string
  status: 'pending' | 'in_progress' | 'completed'
  questions: Array<{
    id: string
    text: string
    questionType: 'technical' | 'behavioral' | 'situational'
    skillTag: string
  }>
  transcript?: string
  overallScore?: number
  analysis?: {
    overallScore: number
    summary: string
    strengths: string[]
    areasForImprovement: string[]
    skillAssessments: Array<{
      skill: string
      score: number
      feedback: string
    }>
    recommendations: string[]
  }
}

export default function InterviewSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const sessionId = params.id as string

  const [session, setSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return

      try {
        const response = await fetch(`/api/interviews/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSession(data.session)
        } else {
          // Create a new session if not found
          const newSession: InterviewSession = {
            id: sessionId,
            jobTitle: 'General Interview',
            status: 'pending',
            questions: [
              {
                id: '1',
                text: 'Tell me about yourself and your professional background.',
                questionType: 'behavioral',
                skillTag: 'communication'
              },
              {
                id: '2', 
                text: 'Describe a challenging project you worked on and how you overcame obstacles.',
                questionType: 'behavioral',
                skillTag: 'problem-solving'
              },
              {
                id: '3',
                text: 'How do you stay updated with the latest technologies in your field?',
                questionType: 'technical',
                skillTag: 'learning-agility'
              },
              {
                id: '4',
                text: 'Describe a time when you had to work with a difficult team member.',
                questionType: 'situational',
                skillTag: 'teamwork'
              },
              {
                id: '5',
                text: 'Where do you see yourself in the next 5 years?',
                questionType: 'behavioral',
                skillTag: 'career-planning'
              }
            ]
          }
          setSession(newSession)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        setError('Failed to load interview session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const handleInterviewComplete = async (transcripts: VapiTranscript[]) => {
    if (!session) return

    try {
      setAnalyzing(true)
      
      // Trigger AI analysis
      const analysisResponse = await fetch('/api/interviews/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: session.id }),
      })

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setSession(prev => prev ? {
          ...prev,
          status: 'completed',
          transcript: transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n'),
          analysis: analysisData.analysis
        } : null)
      }
    } catch (error) {
      console.error('Error analyzing interview:', error)
      setError('Failed to analyze interview')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleInterviewError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading interview session...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session not found</h2>
          <p className="text-gray-600 mb-6">The interview session you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/interviews')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/interviews')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.jobTitle}</h1>
            <p className="text-gray-600">Interview Session</p>
          </div>
        </div>
      </div>

      {session.status === 'completed' && session.analysis ? (
        // Show results after completion
        <div className="space-y-6">
          {/* Overall Results */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                Interview Completed
              </CardTitle>
              <CardDescription>
                Your AI-powered interview analysis is ready
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {session.analysis.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {session.questions.length}
                  </div>
                  <p className="text-sm text-gray-600">Questions Answered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {session.analysis.skillAssessments.length}
                  </div>
                  <p className="text-sm text-gray-600">Skills Assessed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths & Improvements */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.analysis.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Skill Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.analysis.skillAssessments.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-sm text-gray-600">{skill.score}%</span>
                      </div>
                      <Progress value={skill.score} className="mb-2" />
                      <p className="text-sm text-gray-600">{skill.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to improve your interview performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {session.analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => router.push('/interviews')}>
              <FileText className="h-4 w-4 mr-2" />
              Take Another Interview
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/progress')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </div>
        </div>
      ) : analyzing ? (
        // Show analysis loading state
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Interview</h3>
              <p className="text-gray-600">
                Our AI is processing your responses and generating detailed feedback...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Show voice interview component
        <VoiceInterview
          sessionId={session.id}
          candidateName={user?.firstName || 'Candidate'}
          jobTitle={session.jobTitle}
          questions={session.questions}
          onComplete={handleInterviewComplete}
          onError={handleInterviewError}
        />
      )}
    </DashboardLayout>
  )
}