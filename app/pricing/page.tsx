import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    period: 'month',
    description: 'Perfect for getting started with mock interviews',
    features: [
      '3 mock interviews per month',
      'Basic AI feedback reports',
      'Resume analysis',
      'Email support',
      'Progress tracking',
    ],
    limitations: [
      'No voice interviews',
      'Limited analytics',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    price: 19.99,
    period: 'month',
    description: 'Most popular for serious job seekers',
    features: [
      'Unlimited mock interviews',
      'Detailed AI feedback reports',
      'Advanced resume analysis',
      'Voice-based interviews',
      'Real-time proctoring',
      'Advanced analytics',
      'Priority support',
    ],
    limitations: [],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 49.99,
    period: 'month',
    description: 'For recruiters and hiring teams',
    features: [
      'Everything in Premium',
      'Custom interview questions',
      'Team management',
      'Recruiter dashboard',
      'Candidate analytics',
      'API access',
      'Dedicated support',
    ],
    limitations: [],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your interview preparation needs. 
            All plans include our core AI-powered features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Link href="/sign-up" className="block">
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a custom solution?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact us for enterprise pricing and custom features.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}
