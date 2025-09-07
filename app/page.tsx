import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Brain, Users, BarChart3, Mic, Camera } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Next Interview with
            <span className="text-purple-600"> AI-Powered Practice</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Get personalized mock interviews, real-time feedback, and detailed analytics 
            to land your dream job. Practice with AI that adapts to your skill level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Ace Your Interview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-gray-900 mb-4" />
                <CardTitle>AI-Generated Questions</CardTitle>
                <CardDescription>
                  Get personalized questions based on your resume and target job description
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mic className="h-12 w-12 text-gray-900 mb-4" />
                <CardTitle>Voice Interviews</CardTitle>
                <CardDescription>
                  Practice with voice-based interviews using advanced speech recognition technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Camera className="h-12 w-12 text-gray-900 mb-4" />
                <CardTitle>Real-time Proctoring</CardTitle>
                <CardDescription>
                  Ensure interview integrity with AI-powered proctoring and monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Track your progress with comprehensive performance analytics and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Recruiter Dashboard</CardTitle>
                <CardDescription>
                  For recruiters: manage candidates, create job postings, and review results
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Smart Feedback</CardTitle>
                <CardDescription>
                  Receive detailed AI-generated feedback on your strengths and areas for improvement
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of candidates who have improved their interview skills with our AI platform.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">AI Interview</span>
          </div>
          <p className="text-gray-400">
            © 2024 AI Interview Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
