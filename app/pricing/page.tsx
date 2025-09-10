import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star, Zap, Crown, Sparkles, ArrowRight, Shield, Users, Headphones } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'month',
    description: 'Perfect for trying out our AI interview platform',
    features: [
      '2 mock interviews per month',
      'Basic AI feedback',
      'Resume analysis',
      'Email support',
      'Progress tracking',
      'Community access'
    ],
    limitations: [
      'No voice interviews',
      'Limited analytics',
      'No proctoring features'
    ],
    popular: false,
    icon: Star,
    color: 'gray',
    badge: 'Free Forever'
  },
  {
    name: 'Professional',
    price: 19.99,
    period: 'month',
    description: 'Most popular for serious job seekers',
    features: [
      'Unlimited mock interviews',
      'Advanced AI feedback & scoring',
      'Voice & video interviews',
      'Real-time proctoring',
      'Detailed analytics & insights',
      'Resume optimization',
      'Priority support',
      'Interview scheduling'
    ],
    limitations: [],
    popular: true,
    icon: Zap,
    color: 'blue',
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For teams, recruiters and organizations',
    features: [
      'Everything in Professional',
      'Team management dashboard',
      'Custom interview templates',
      'Bulk candidate management',
      'Advanced reporting & analytics',
      'API access & integrations',
      'White-label options',
      'Dedicated account manager',
      'Custom training sessions'
    ],
    limitations: [],
    popular: false,
    icon: Crown,
    color: 'purple',
    badge: 'Best Value'
  },
]

export default function PricingPage() {
  const getColorClasses = (color: string) => {
    const colors = {
      gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-700 border-gray-200',
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200'
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
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan for your interview preparation needs. Start free and upgrade as you grow.
            All plans include our core AI-powered features.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color)
            const [gradientClasses, bgClasses, textClasses, borderClasses] = colorClasses.split(' ')
            
            return (
              <Card 
                key={plan.name} 
                className={`relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105 lg:scale-110' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-medium shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 pt-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${gradientClasses} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2 text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">{plan.description}</CardDescription>
                  <div className="mt-6">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Free</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">${plan.price}</span>
                        <span className="text-gray-600 text-lg">/{plan.period}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-8">
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-start space-x-3">
                        <div className="p-1 bg-red-100 rounded-full mt-0.5">
                          <X className="h-3 w-3 text-red-600" />
                        </div>
                        <span className="text-gray-500 text-sm line-through">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link href={plan.name === 'Enterprise' ? '/contact' : '/sign-up'} className="block">
                      <Button 
                        className={`w-full h-12 text-base font-medium transition-all duration-300 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                            : 'border-2 hover:bg-gray-50'
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.name === 'Enterprise' ? 'Contact Sales' : plan.price === 0 ? 'Start Free' : 'Get Started'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Trusted by thousands of job seekers and recruiters worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center p-6">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Enterprise-grade security with end-to-end encryption</p>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">10K+ Users</h3>
              <p className="text-gray-600">Join thousands of successful job seekers</p>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center p-6">
              <Headphones className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get help whenever you need it</p>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">Our Starter plan is free forever. You can also try Professional features with a 7-day free trial.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Join thousands of successful candidates who improved their interview skills with our AI platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 text-white border-white/50 hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
