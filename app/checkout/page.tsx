'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    features: [
      '3 mock interviews per month',
      'Basic AI feedback reports',
      'Resume analysis',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    features: [
      'Unlimited mock interviews',
      'Detailed AI feedback reports',
      'Advanced resume analysis',
      'Voice-based interviews',
      'Real-time proctoring',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    features: [
      'Everything in Premium',
      'Custom interview questions',
      'Team management',
      'Recruiter dashboard',
      'Candidate analytics',
      'API access',
      'Dedicated support',
    ],
  },
]

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (success) {
      // Redirect to dashboard on success
      window.location.href = '/dashboard'
    }
  }, [success])

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: getPriceId(selectedPlan),
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        })

        if (error) {
          setError(error.message || 'An error occurred')
        }
      }
    } catch (err) {
      setError('Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  const getPriceId = (planId: string) => {
    // In a real app, these would be actual Stripe price IDs
    const priceIds: Record<string, string> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
      premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    }
    return priceIds[planId]
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. Redirecting to dashboard...
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Canceled</h2>
            <p className="text-gray-600 mb-6">
              Your payment was canceled. You can try again or choose a different plan.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">Select the plan that best fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="text-center">
          <Button 
            onClick={handleCheckout} 
            size="lg" 
            disabled={loading}
            className="px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe to ${plans.find(p => p.id === selectedPlan)?.name} Plan`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
