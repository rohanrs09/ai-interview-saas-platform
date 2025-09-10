'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  StopCircle,
  Send,
  Loader2
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/dashboard-layout'

interface Question {
  id: string
  questionText: string
  type: 'behavioral' | 'technical' | 'situational'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeLimit: number
  order: number
}

interface SessionData {
  id: string
  jobTitle: string
  company: string
  status: string
  totalQuestions: number
  currentQuestion: number
  questions: Question[]
}

export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const sessionId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes default
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/interviews/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionData({
            id: data.session.id,
            jobTitle: data.job?.title || 'Interview',
            company: data.job?.company || 'Company',
            status: data.session.status,
            totalQuestions: data.questions.length,
            currentQuestion: 1,
            questions: data.questions
          })
          if (data.questions.length > 0) {
            setTimeRemaining(data.questions[0].timeLimit || 300)
          }
        } else {
          // Use mock data if API fails
          setSessionData({
            id: sessionId,
            jobTitle: 'Frontend Developer',
            company: 'Tech Corp',
            status: 'pending',
            totalQuestions: 5,
            currentQuestion: 1,
            questions: [
              {
                id: '1',
                questionText: 'Tell me about yourself and your experience.',
                type: 'behavioral',
                difficulty: 'beginner',
                timeLimit: 180,
                order: 1
              },
              {
                id: '2',
                questionText: 'What are your greatest strengths?',
                type: 'behavioral',
                difficulty: 'beginner',
                timeLimit: 120,
                order: 2
              },
              {
                id: '3',
                questionText: 'Describe a challenging technical problem you solved.',
                type: 'technical',
                difficulty: 'intermediate',
                timeLimit: 240,
                order: 3
              },
              {
                id: '4',
                questionText: 'How do you stay updated with technology?',
                type: 'behavioral',
                difficulty: 'beginner',
                timeLimit: 120,
                order: 4
              },
              {
                id: '5',
                questionText: 'Where do you see yourself in 5 years?',
                type: 'behavioral',
                difficulty: 'beginner',
                timeLimit: 120,
                order: 5
              }
            ]
          })
          setTimeRemaining(180)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  // Timer effect
  useEffect(() => {
    if (sessionStarted && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextQuestion()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [sessionStarted, isPaused, timeRemaining])

  const startSession = async () => {
    setSessionStarted(true)
    // Update session status to in_progress
    try {
      await fetch(`/api/interviews/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      })
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) return

    setIsSubmitting(true)
    const currentQuestion = sessionData?.questions[currentQuestionIndex]
    
    if (currentQuestion) {
      // Save answer
      const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer }
      setAnswers(newAnswers)

      // Submit answer to API
      try {
        await fetch(`/api/interviews/${sessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            answer: currentAnswer,
            timeSpent: currentQuestion.timeLimit - timeRemaining
          })
        })
      } catch (error) {
        console.error('Error submitting answer:', error)
      }
    }

    setIsSubmitting(false)
    setCurrentAnswer('')
    handleNextQuestion()
  }

  const handleNextQuestion = () => {
    if (!sessionData) return
    
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setTimeRemaining(sessionData.questions[nextIndex].timeLimit || 300)
    } else {
      completeInterview()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      const prevAnswer = sessionData?.questions[prevIndex].id
      if (prevAnswer && answers[prevAnswer]) {
        setCurrentAnswer(answers[prevAnswer])
      }
    }
  }

  const completeInterview = async () => {
    setIsSubmitting(true)
    try {
      await fetch(`/api/interviews/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      router.push(`/interviews/${sessionId}/results`)
    } catch (error) {
      console.error('Error completing interview:', error)
      router.push(`/interviews/${sessionId}/results`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading interview session...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!sessionData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load interview session</p>
          <Button onClick={() => router.push('/interviews')}>Back to Interviews</Button>
        </div>
      </DashboardLayout>
    )
  }

  const currentQuestion = sessionData.questions[currentQuestionIndex]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sessionData.jobTitle}</h1>
              <p className="text-gray-600">{sessionData.company}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                Question {currentQuestionIndex + 1} of {sessionData.totalQuestions}
              </Badge>
              <div className="flex items-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / sessionData.totalQuestions) * 100} 
            className="mt-4 h-2"
          />
        </div>

        {!sessionStarted ? (
          // Pre-interview screen
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Start Your Interview?</CardTitle>
              <CardDescription className="mt-2">
                You'll have {sessionData.totalQuestions} questions to answer.
                Each question has a time limit. Make sure you're in a quiet environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="font-medium">Timed Questions</p>
                    <p className="text-sm text-gray-600">Each question has a time limit</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4 text-center">
                    <Mic className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium">Audio Optional</p>
                    <p className="text-sm text-gray-600">Answer via text or voice</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-4 text-center">
                    <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium">Video Optional</p>
                    <p className="text-sm text-gray-600">Enable for realistic practice</p>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={startSession}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Interview in progress
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main interview area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">Question {currentQuestionIndex + 1}</CardTitle>
                      <Badge className="mb-3" variant="outline">
                        {currentQuestion.type} • {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </div>
                  <p className="text-lg font-medium mt-4">{currentQuestion.questionText}</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] resize-none"
                    disabled={isPaused}
                  />
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentAnswer('')}
                        disabled={!currentAnswer || isPaused}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={!currentAnswer.trim() || isSubmitting || isPaused}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : currentQuestionIndex === sessionData.totalQuestions - 1 ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {currentQuestionIndex === sessionData.totalQuestions - 1 ? 'Submit & Finish' : 'Submit & Next'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side panel */}
            <div className="space-y-6">
              {/* Media controls */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Interview Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Video</span>
                    <Button
                      variant={isVideoEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio</span>
                    <Button
                      variant={isAudioEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    >
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress overview */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessionData.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          idx === currentQuestionIndex
                            ? 'bg-indigo-100 border border-indigo-300'
                            : answers[q.id]
                            ? 'bg-green-50'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">Question {idx + 1}</span>
                        {answers[q.id] && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}