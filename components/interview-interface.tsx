'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Proctoring } from '@/components/proctoring'
import { Mic, MicOff, Video, VideoOff, Send, CheckCircle, Shield } from 'lucide-react'

interface Question {
  id: number
  skill: string
  question: string
}

interface InterviewInterfaceProps {
  questions: Question[]
  onAnswerSubmit: (questionId: number, answer: string) => void
  onComplete: () => void
}

export function InterviewInterface({ questions, onAnswerSubmit, onComplete }: InterviewInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showProctoring, setShowProctoring] = useState(false)
  const [anomalies, setAnomalies] = useState<Array<{ type: string; severity: string; timestamp: Date }>>([])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isAnswered = answers[currentQuestion.id]?.trim().length > 0

  const handleAnswerSubmit = () => {
    if (currentAnswer.trim()) {
      onAnswerSubmit(currentQuestion.id, currentAnswer)
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswer }))
      setCurrentAnswer('')
      
      if (isLastQuestion) {
        onComplete()
      } else {
        setCurrentQuestionIndex(prev => prev + 1)
      }
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
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

  const handleLog = (event: { type: string; data: any; timestamp: Date }) => {
    console.log('Proctoring event:', event)
    // In a real app, you'd send this to your API
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={isVideoOn ? "default" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isRecording ? "default" : "outline"}
                size="sm"
                onClick={toggleRecording}
              >
                {isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={showProctoring ? "default" : "outline"}
                size="sm"
                onClick={() => setShowProctoring(!showProctoring)}
              >
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription className="text-sm text-blue-600 font-medium">
                  Skill: {currentQuestion.skill}
                </CardDescription>
              </div>
              {isAnswered && (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-800 mb-6">
              {currentQuestion.question}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">
                  {currentAnswer.length} characters
                </div>
                <div className="flex space-x-2">
                  {!isLastQuestion && (
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={!isAnswered}
                    >
                      Skip Question
                    </Button>
                  )}
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim()}
                  >
                    {isLastQuestion ? 'Complete Interview' : 'Submit Answer'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proctoring Panel */}
        {showProctoring && (
          <div className="mb-6">
            <Proctoring
              onAnomaly={handleAnomaly}
              onLog={handleLog}
            />
          </div>
        )}

        {/* Questions Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Questions Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    index === currentQuestionIndex
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : answers[question.id]
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Q{index + 1}</div>
                  <div className="text-xs text-gray-500 truncate">{question.skill}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
