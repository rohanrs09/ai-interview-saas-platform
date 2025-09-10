import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Mic, 
  Video, 
  BarChart3, 
  Shield, 
  Clock, 
  Target, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Globe,
  Award,
  FileText,
  MessageSquare,
  TrendingUp,
  Eye,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Question Generation",
      description: "Advanced AI analyzes your resume and generates personalized interview questions tailored to your experience and target role.",
      benefits: ["Personalized questions", "Industry-specific content", "Skill-based targeting", "Real-time adaptation"],
      color: "blue"
    },
    {
      icon: Mic,
      title: "Voice Interview Practice",
      description: "Practice with realistic voice-based interviews using advanced speech recognition and natural language processing.",
      benefits: ["Speech recognition", "Pronunciation feedback", "Natural conversation flow", "Voice confidence building"],
      color: "green"
    },
    {
      icon: Video,
      title: "Video Interview Simulation",
      description: "Experience realistic video interviews with AI-powered facial expression analysis and body language feedback.",
      benefits: ["Facial expression analysis", "Body language tips", "Eye contact tracking", "Professional presence coaching"],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Comprehensive analytics track your progress, identify strengths, and highlight areas for improvement.",
      benefits: ["Detailed scoring", "Progress tracking", "Skill gap analysis", "Performance trends"],
      color: "orange"
    },
    {
      icon: Shield,
      title: "AI Proctoring System",
      description: "Ensure interview integrity with advanced AI monitoring that maintains fairness and authenticity.",
      benefits: ["Cheating prevention", "Identity verification", "Environment monitoring", "Fair assessment"],
      color: "red"
    },
    {
      icon: FileText,
      title: "Resume Analysis & Optimization",
      description: "AI-powered resume analysis extracts skills, suggests improvements, and generates targeted questions.",
      benefits: ["Skill extraction", "Resume optimization", "ATS compatibility", "Keyword suggestions"],
      color: "indigo"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200",
      green: "from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200",
      purple: "from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200",
      orange: "from-orange-500 to-orange-600 bg-orange-50 text-orange-700 border-orange-200",
      red: "from-red-500 to-red-600 bg-red-50 text-red-700 border-red-200",
      indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-700 border-indigo-200"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="bg-white/80 backdrop-blur-sm py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700 mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Cutting-Edge AI Technology
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Powerful Features for Interview Success
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover how our AI-powered platform transforms interview preparation with advanced features 
            designed to boost your confidence and improve your performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/interviews">
              <Button size="lg" className="px-8">
                Try Features Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Complete Interview Preparation Suite
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Everything you need to ace your next interview, powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color)
              const [gradientClasses, bgClasses, textClasses, borderClasses] = colorClasses.split(' ')
              
              return (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 bg-gradient-to-r ${gradientClasses} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2 text-gray-900">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-6 p-4 ${bgClasses} rounded-xl border ${borderClasses}`}>
                      <p className={`text-sm font-medium ${textClasses}`}>
                        ✨ Available in Pro and Enterprise plans
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              More Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Additional tools to enhance your interview preparation experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Timed Practice</h3>
                <p className="text-sm text-gray-600">Realistic time constraints to simulate real interview pressure</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Language</h3>
                <p className="text-sm text-gray-600">Practice interviews in multiple languages with native AI</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Team Practice</h3>
                <p className="text-sm text-gray-600">Collaborative practice sessions with peers and mentors</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                <p className="text-sm text-gray-600">Earn certificates to showcase your interview skills</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              How Our AI Works
            </h2>
            <p className="text-xl text-gray-600">
              Understanding the technology behind your interview success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Resume Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes your resume to understand your skills, experience, and career goals, 
                creating a personalized profile for targeted question generation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. AI Question Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced machine learning algorithms generate relevant, challenging questions 
                based on your profile and the specific role you're targeting.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Performance Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time feedback and detailed analytics help you understand your performance 
                and identify areas for improvement with actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Connect with your favorite tools and platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect Your Workflow</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Calendar Integration</h4>
                    <p className="text-gray-600">Sync with Google Calendar, Outlook, and other scheduling tools</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Video Conferencing</h4>
                    <p className="text-gray-600">Compatible with Zoom, Teams, and other video platforms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">ATS Integration</h4>
                    <p className="text-gray-600">Connect with applicant tracking systems for seamless workflow</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">API Access</h4>
                    <p className="text-gray-600">Full API access for custom integrations and automation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Slack</h4>
                <p className="text-xs text-gray-600">Team notifications</p>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Zoom</h4>
                <p className="text-xs text-gray-600">Video interviews</p>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 text-center">
                <Headphones className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Teams</h4>
                <p className="text-xs text-gray-600">Collaboration</p>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 text-center">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Zapier</h4>
                <p className="text-xs text-gray-600">Automation</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Start your free trial today and discover how our AI-powered features can transform your interview preparation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/interviews">
              <Button size="lg" className="px-8 bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 text-white border-white/50 hover:bg-white/10 backdrop-blur-sm">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
