'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Trophy, Target, Clock, Brain, TrendingUp, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

interface InterviewResult {
  score: number
  totalQuestions: number
  answeredQuestions: number
  timeSpent: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: Array<{
    question: string
    answer: string
    score: number
    feedback: string
  }>
  skillAnalysis: Array<{
    skill: string
    level: 'beginner' | 'intermediate' | 'advanced'
    score: number
  }>
}

export default function InterviewResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = params.id as string
  const score = parseInt(searchParams.get('score') || '0')

  const [result, setResult] = useState<InterviewResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    const mockResult: InterviewResult = {
      score,
      totalQuestions: 5,
      answeredQuestions: 5,
      timeSpent: 32, // minutes
      strengths: [
        'Strong understanding of React concepts',
        'Good problem-solving approach',
        'Clear communication skills',
        'Experience with modern JavaScript'
      ],
      improvements: [
        'Need more practice with advanced React patterns',
        'Could improve on system design questions',
        'Work on explaining complex concepts more clearly'
      ],
      detailedFeedback: [
        {
          question: 'Explain the difference between React functional components and class components.',
          answer: 'Functional components are simpler and use hooks for state management...',
          score: 85,
          feedback: 'Good explanation of the key differences. Could mention more about lifecycle methods.'
        },
        {
          question: 'How would you optimize the performance of a React application?',
          answer: 'I would use React.memo, useMemo, and useCallback to prevent unnecessary re-renders...',
          score: 90,
          feedback: 'Excellent answer! You covered all the major optimization techniques.'
        },
        {
          question: 'Describe a time when you had to work with a difficult team member.',
          answer: 'I once worked with someone who was resistant to code reviews...',
          score: 75,
          feedback: 'Good example, but try to focus more on the resolution and learning outcomes.'
        }
      ],
      skillAnalysis: [
        { skill: 'React', level: 'advanced', score: 88 },
        { skill: 'JavaScript', level: 'intermediate', score: 82 },
        { skill: 'Problem Solving', level: 'intermediate', score: 78 },
        { skill: 'Communication', level: 'advanced', score: 85 }
      ]
    }

    setResult(mockResult)
    setLoading(false)
  }, [score])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! You have excellent technical skills.'
    if (score >= 80) return 'Great job! You performed very well in this interview.'
    if (score >= 70) return 'Good work! You have solid skills with room for improvement.'
    if (score >= 60) return 'Not bad! Keep practicing to improve your skills.'
    return 'Keep practicing! Focus on the areas that need improvement.'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Generating your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Results not found</h2>
          <p className="text-gray-600 mb-4">Unable to load your interview results.</p>
          <Link href="/interviews">
            <Button>Back to Interviews</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/interviews" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
          <p className="text-lg text-gray-600 mb-4">{getScoreMessage(result.score)}</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {result.answeredQuestions} of {result.totalQuestions} questions answered
              </div>
              <Progress value={result.score} className="mb-4" />
              <div className="text-xs text-gray-500">
                Time spent: {result.timeSpent} minutes
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Interview Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.answeredQuestions}</div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.timeSpent}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.strengths.length}</div>
                  <div className="text-sm text-gray-600">Strengths</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <Target className="h-5 w-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Skill Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Skill Analysis
            </CardTitle>
            <CardDescription>
              Your performance across different technical areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.skillAnalysis.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 w-24">{skill.skill}</span>
                    <Badge className={getLevelColor(skill.level)}>
                      {skill.level}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {skill.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
            <CardDescription>
              Question-by-question analysis of your responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.detailedFeedback.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">
                      Question {index + 1}
                    </h4>
                    <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Question:</strong> {item.question}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Your Answer:</strong> {item.answer}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Feedback:</strong> {item.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>
              Based on your performance, here's what we recommend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Practice Areas</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Advanced React patterns and hooks</li>
                  <li>• System design fundamentals</li>
                  <li>• Behavioral interview techniques</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Resources</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• React documentation and tutorials</li>
                  <li>• Mock interview practice sessions</li>
                  <li>• Coding challenge platforms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Link href="/interviews">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interviews
            </Button>
          </Link>
          <Link href={`/interviews/${jobId}`}>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Retake Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
