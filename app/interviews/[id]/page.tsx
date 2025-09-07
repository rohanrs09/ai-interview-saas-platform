'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { InterviewInterface } from '@/components/interview-interface'
import { ArrowLeft, Clock, Award, Brain, Mic, Camera, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  text: string
  type: 'technical' | 'behavioral' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  skills: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
}

export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [showProctoring, setShowProctoring] = useState(false)
  const [anomalies, setAnomalies] = useState<Array<{ type: string; severity: string; timestamp: Date }>>([])
  const [loading, setLoading] = useState(true)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    // Mock data for now
    const mockJob: Job = {
      id: jobId,
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      difficulty: 'advanced',
      estimatedTime: 45
    }

    const mockQuestions: Question[] = [
      {
        id: '1',
        text: 'Explain the difference between React functional components and class components. What are the advantages of using hooks?',
        type: 'technical',
        difficulty: 'medium',
        timeLimit: 5
      },
      {
        id: '2',
        text: 'How would you optimize the performance of a React application that has thousands of components rendering large lists?',
        type: 'technical',
        difficulty: 'hard',
        timeLimit: 7
      },
      {
        id: '3',
        text: 'Describe a time when you had to work with a difficult team member. How did you handle the situation?',
        type: 'behavioral',
        difficulty: 'medium',
        timeLimit: 4
      },
      {
        id: '4',
        text: 'You discover a critical bug in production that affects user data. Walk me through your debugging process and how you would handle this situation.',
        type: 'situational',
        difficulty: 'hard',
        timeLimit: 6
      },
      {
        id: '5',
        text: 'How do you handle state management in large React applications? Compare different approaches like Redux, Context API, and Zustand.',
        type: 'technical',
        difficulty: 'hard',
        timeLimit: 8
      }
    ]

    setJob(mockJob)
    setQuestions(mockQuestions)
    setTimeRemaining(mockJob.estimatedTime * 60) // Convert to seconds
    setLoading(false)
  }, [jobId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleCompleteInterview()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStarted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartInterview = () => {
    setSessionStarted(true)
  }

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleCompleteInterview = async () => {
    // Calculate score based on answers
    const totalQuestions = questions.length
    const answeredQuestions = Object.keys(answers).length
    const score = Math.round((answeredQuestions / totalQuestions) * 100)
    
    // In a real app, you'd send this to your API
    console.log('Interview completed with score:', score)
    
    // Redirect to results page
    router.push(`/interviews/${jobId}/results?score=${score}`)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleCompleteInterview()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual voice recording
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    // TODO: Implement video toggle
  }

  const handleAnomaly = (type: string, severity: 'low' | 'medium' | 'high') => {
    setAnomalies(prev => [...prev, { type, severity, timestamp: new Date() }])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (!job || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview not found</h2>
          <p className="text-gray-600 mb-4">The interview you're looking for doesn't exist.</p>
          <Link href="/interviews">
            <Button>Back to Interviews</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/interviews" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interviews
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription className="text-lg">
                {job.company} • {job.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.estimatedTime} minutes
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {questions.length} questions
                </div>
                <Badge className={job.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                                 job.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800'}>
                  {job.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Interview Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet environment with good lighting</li>
                  <li>• Have your camera and microphone ready</li>
                  <li>• Close unnecessary applications and browser tabs</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">During the interview:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Answer each question thoughtfully and completely</li>
                  <li>• You can use voice recording or type your answers</li>
                  <li>• Take your time - there's no rush</li>
                  <li>• Be honest about your experience and knowledge</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Important:</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• The interview is proctored - no external help allowed</li>
                  <li>• Stay in frame and maintain eye contact with the camera</li>
                  <li>• Any suspicious activity will be flagged</li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={handleStartInterview} className="px-8">
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/interviews" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-600">{job.company}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isVideoOn ? "default" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isVideoOn ? 'Video On' : 'Video Off'}
              </Button>
              
              <Button
                variant={isRecording ? "default" : "outline"}
                size="sm"
                onClick={toggleRecording}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? 'Recording' : 'Record'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-3">
            <InterviewInterface
              questions={questions}
              onAnswerSubmit={handleAnswerSubmit}
              onComplete={handleCompleteInterview}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions</span>
                    <span>{currentQuestionIndex + 1} / {questions.length}</span>
                  </div>
                  <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                  
                  <div className="flex justify-between text-sm">
                    <span>Answered</span>
                    <span>{Object.keys(answers).length} / {questions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full text-left p-2 rounded text-sm ${
                        index === currentQuestionIndex
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : answers[question.id]
                          ? 'bg-green-100 text-green-900 border border-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Question {index + 1}</span>
                        <div className="flex items-center space-x-1">
                          {answers[question.id] && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proctoring Alerts */}
            {anomalies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Proctoring Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {anomalies.slice(-3).map((anomaly, index) => (
                      <div key={index} className="text-xs text-red-600">
                        {anomaly.type} - {anomaly.severity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                className="flex-1"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}