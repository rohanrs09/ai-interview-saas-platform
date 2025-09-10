import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Brain, Users, BarChart3, Mic, Camera, CheckCircle, Star, Zap, Shield, TrendingUp, Award, Sparkles, Play, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl -z-10 animate-bounce" style={{animationDuration: '6s'}} />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl -z-10 animate-bounce" style={{animationDuration: '8s'}} />
        
        <div className="container mx-auto text-center max-w-7xl relative">
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/50 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              AI-Powered Interview Platform
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 mb-10 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Master Your Next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
              Interview
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-16 max-w-4xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            Get personalized mock interviews, real-time feedback, and detailed analytics 
            to land your dream job. Practice with AI that adapts to your skill level.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <Link href="/sign-up">
              <Button size="lg" className="group text-lg px-12 py-5 h-16 w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500 hover:scale-105 animate-gradient-x">
                <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Start Practicing Now
                <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="group text-lg px-12 py-5 h-16 w-full sm:w-auto border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <BarChart3 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                View Pricing
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CheckCircle className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span className="font-medium">10,000+ Interviews Completed</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Star className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="font-medium">4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Award className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span className="font-medium">95% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-white to-slate-50/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] -z-10" />
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-6 px-6 py-3 border-indigo-200 bg-indigo-50/50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-all duration-300">
              <Star className="w-4 h-4 mr-2 animate-spin" style={{animationDuration: '3s'}} />
              Premium Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Ace Your Interview</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools and insights you need to succeed in your next interview.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <Card className="group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-indigo-100/90 hover:to-blue-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <Brain className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">AI-Generated Questions</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Get personalized questions based on your resume and target job description with intelligent difficulty scaling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-100/90 hover:to-pink-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <Mic className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Voice Interviews</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Practice with voice-based interviews using advanced speech recognition and natural language processing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-emerald-100/90 hover:to-green-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Real-time Proctoring</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Ensure interview integrity with AI-powered proctoring and comprehensive monitoring systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-orange-100/90 hover:to-amber-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <TrendingUp className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Detailed Analytics</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Track your progress with comprehensive performance analytics, insights, and improvement recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-cyan-100/90 hover:to-sky-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <Users className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Recruiter Dashboard</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  For recruiters: manage candidates, create job postings, and review comprehensive interview results.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 border-0 shadow-xl hover:-translate-y-3 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-violet-100/90 hover:to-fuchsia-100/90">
              <CardHeader className="pb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <Award className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Smart Feedback</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed text-base">
                  Receive detailed AI-generated feedback on your strengths, areas for improvement, and actionable insights.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">10K+</div>
              <div className="text-slate-600 font-medium text-lg">Interviews Completed</div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">95%</div>
              <div className="text-slate-600 font-medium text-lg">Success Rate</div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">4.9★</div>
              <div className="text-slate-600 font-medium text-lg">Average Rating</div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-slate-600 font-medium text-lg">Companies Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '4s'}} />
        </div>
        
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <Badge variant="secondary" className="mb-8 px-6 py-3 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-105">
            <Zap className="w-5 h-5 mr-2 animate-pulse" />
            Limited Time Offer
          </Badge>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to Land Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100">
              Dream Job?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of candidates who have improved their interview skills and landed their dream jobs with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="group text-lg px-12 py-5 h-16 w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-105">
                <Sparkles className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Start Your Free Trial
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="group text-lg px-12 py-5 h-16 w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <BarChart3 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                View Pricing Plans
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-300" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-300" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.1),transparent_50%)] -z-10" />
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">AI Interview</span>
                  <div className="text-sm text-slate-400 font-medium">Powered by AI</div>
                </div>
              </div>
              <p className="text-slate-300 mb-8 max-w-md text-lg leading-relaxed">
                Empowering candidates and recruiters with AI-powered interview solutions. Practice, improve, and succeed with confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 transition-colors duration-200">
                  <Star className="w-3 h-3 mr-2 text-amber-400" />
                  4.9/5 Rating
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 transition-colors duration-200">
                  <Users className="w-3 h-3 mr-2 text-indigo-400" />
                  10K+ Users
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 transition-colors duration-200">
                  <Award className="w-3 h-3 mr-2 text-emerald-400" />
                  Industry Leader
                </Badge>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-6 text-xl text-white">Platform</h3>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Dashboard</Link></li>
                <li><Link href="/interviews" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Interviews</Link></li>
                <li><Link href="/analytics" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Analytics</Link></li>
                <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Pricing</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-bold mb-6 text-xl text-white">Company</h3>
              <ul className="space-y-3 text-slate-300">
                <li><Link href="/about" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />About</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors duration-200 flex items-center group"><ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2024 AI Interview Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-slate-400">Built with</span>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 text-xs hover:bg-slate-700 transition-colors duration-200">
                  Next.js
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 text-xs hover:bg-slate-700 transition-colors duration-200">
                  TypeScript
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 text-xs hover:bg-slate-700 transition-colors duration-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
