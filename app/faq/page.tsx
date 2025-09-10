import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Users,
  CreditCard,
  Settings,
  Brain,
  Video,
  Mic,
  BarChart3
} from 'lucide-react'
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqCategories = [
    {
      title: "Getting Started",
      icon: HelpCircle,
      color: "blue",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Simply click 'Sign Up' and choose to register with your email or Google account. You'll be guided through a quick onboarding process to set up your profile and preferences."
        },
        {
          question: "Is there a free plan available?",
          answer: "Yes! Our Starter plan is completely free and includes 2 mock interviews per month, basic AI feedback, resume analysis, and progress tracking. Perfect for trying out our platform."
        },
        {
          question: "How quickly can I start practicing interviews?",
          answer: "You can start practicing immediately after signing up. Upload your resume (optional but recommended for personalized questions), select your target role, and begin your first mock interview within minutes."
        },
        {
          question: "Do I need any special software or equipment?",
          answer: "No special software required! Our platform works in any modern web browser. For voice and video interviews, you'll need a microphone and camera, which are built into most laptops and smartphones."
        }
      ]
    },
    {
      title: "AI Features & Technology",
      icon: Brain,
      color: "purple",
      faqs: [
        {
          question: "How does the AI generate personalized questions?",
          answer: "Our AI analyzes your resume, target role, and industry to create relevant, challenging questions. It considers your experience level, skills, and career goals to ensure questions match real interview scenarios you might face."
        },
        {
          question: "How accurate is the AI feedback?",
          answer: "Our AI is trained on thousands of successful interviews and continuously improves. It provides detailed feedback on content, delivery, confidence, and specific areas for improvement with 90%+ accuracy compared to human evaluators."
        },
        {
          question: "Can the AI detect if I'm cheating during practice?",
          answer: "Yes, our AI proctoring system monitors for unusual behavior, multiple voices, screen sharing, and other integrity issues. This ensures your practice sessions simulate real interview conditions and provide authentic feedback."
        },
        {
          question: "What languages does the AI support?",
          answer: "Currently, our AI supports English, Spanish, French, German, and Mandarin Chinese. We're continuously adding more languages based on user demand."
        }
      ]
    },
    {
      title: "Interview Practice",
      icon: Video,
      color: "green",
      faqs: [
        {
          question: "What types of interviews can I practice?",
          answer: "You can practice behavioral interviews, technical interviews, case studies, situational questions, and industry-specific scenarios. We support various formats including video, voice-only, and text-based interviews."
        },
        {
          question: "How long are the practice sessions?",
          answer: "Practice sessions typically range from 15-60 minutes depending on the interview type and your preferences. You can customize the duration and number of questions to match your target company's interview format."
        },
        {
          question: "Can I practice for specific companies?",
          answer: "Yes! We have company-specific question banks for 500+ major employers including Google, Amazon, Microsoft, and more. Our AI adapts questions to match each company's known interview style and culture."
        },
        {
          question: "How do I improve my performance over time?",
          answer: "Track your progress through detailed analytics, review AI feedback after each session, focus on recommended improvement areas, and practice regularly. Most users see significant improvement within 2-3 weeks of consistent practice."
        }
      ]
    },
    {
      title: "Billing & Subscriptions",
      icon: CreditCard,
      color: "orange",
      faqs: [
        {
          question: "Can I change or cancel my subscription anytime?",
          answer: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time from your account settings. Changes take effect immediately, and we offer prorated billing for upgrades."
        },
        {
          question: "Do you offer refunds?",
          answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied within the first 30 days, contact our support team for a full refund."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees ever! Our pricing is transparent and includes all features listed in your plan. The only additional costs might be for premium add-ons that you explicitly choose to purchase."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      color: "red",
      faqs: [
        {
          question: "How is my personal data protected?",
          answer: "We use enterprise-grade encryption, secure data centers, and comply with GDPR, CCPA, and SOC 2 standards. Your interview recordings and personal information are encrypted and never shared with third parties."
        },
        {
          question: "Are my practice interviews recorded?",
          answer: "Yes, but only for your personal review and AI analysis. You control your recordings - view, download, or delete them anytime. Recordings are automatically deleted after 90 days unless you choose to keep them longer."
        },
        {
          question: "Can employers see my practice sessions?",
          answer: "Never! Your practice sessions are completely private and confidential. Employers cannot access your practice data, scores, or recordings unless you explicitly choose to share specific results with them."
        },
        {
          question: "Where is my data stored?",
          answer: "All data is stored in secure, SOC 2 compliant data centers in the US and EU. We use AWS infrastructure with end-to-end encryption and regular security audits to ensure maximum protection."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: Settings,
      color: "indigo",
      faqs: [
        {
          question: "What if I experience technical issues during practice?",
          answer: "Our platform includes automatic error recovery and real-time support. If issues persist, contact our 24/7 support team via live chat, email, or phone. We typically resolve technical issues within 2 hours."
        },
        {
          question: "What browsers and devices are supported?",
          answer: "Our platform works on all modern browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, laptop, tablet, smartphone). For the best experience, we recommend using Chrome or Safari on a desktop/laptop."
        },
        {
          question: "Can I use the platform offline?",
          answer: "Currently, our platform requires an internet connection for AI processing and real-time feedback. However, you can download your interview recordings and feedback reports for offline review."
        },
        {
          question: "How do I report bugs or suggest features?",
          answer: "We love feedback! Report bugs or suggest features through our in-app feedback tool, email support@aiinterview.com, or join our community forum. We review all suggestions and regularly implement user-requested features."
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200",
      purple: "from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200",
      green: "from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200",
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
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Answers Fast
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our AI-powered interview platform. 
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="px-8">
                Contact Support
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/interviews">
              <Button variant="outline" size="lg" className="px-8">
                Try Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => {
              const colorClasses = getColorClasses(category.color)
              const [gradientClasses, bgClasses, textClasses, borderClasses] = colorClasses.split(' ')
              
              return (
                <div key={categoryIndex} className="space-y-6">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`p-4 bg-gradient-to-r ${gradientClasses} rounded-2xl shadow-lg`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-gray-600">Common questions about {category.title.toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const itemIndex = categoryIndex * 100 + faqIndex
                      const isOpen = openItems.includes(itemIndex)
                      
                      return (
                        <Card key={faqIndex} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardHeader 
                            className="cursor-pointer hover:bg-gray-50/50 transition-colors duration-200"
                            onClick={() => toggleItem(itemIndex)}
                          >
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-gray-900 pr-4">{faq.question}</CardTitle>
                              <div className="flex-shrink-0">
                                {isOpen ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          
                          {isOpen && (
                            <CardContent className="pt-0 pb-6">
                              <div className={`p-4 ${bgClasses} rounded-xl border ${borderClasses}`}>
                                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-gray-600">
              See why thousands trust our AI interview platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg text-center p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Active Users</p>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg text-center p-6">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">Success Rate</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg text-center p-6">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Support Available</p>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg text-center p-6">
              <Video className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100K+</h3>
              <p className="text-gray-600">Interviews Completed</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Our support team is available 24/7 to help you succeed. Get personalized assistance 
              with any questions about our platform, features, or your interview preparation.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-3">Get instant help from our support team</p>
                <Badge className="bg-green-100 text-green-700">Available Now</Badge>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-3">Detailed responses within 2 hours</p>
                <Badge className="bg-blue-100 text-blue-700">support@aiinterview.com</Badge>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6">
                <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-3">Speak directly with our experts</p>
                <Badge className="bg-purple-100 text-purple-700">Enterprise Only</Badge>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="px-8">
                  Contact Support
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/interviews">
                <Button variant="outline" size="lg" className="px-8">
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Interview Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of successful candidates who improved their interview skills with our AI platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="px-8 bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-8 text-white border-white/50 hover:bg-white/10 backdrop-blur-sm">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
