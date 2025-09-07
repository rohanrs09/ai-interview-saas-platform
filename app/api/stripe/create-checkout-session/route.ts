import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createCheckoutSession, createCustomer, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    
    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const selectedPlan = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]
    
    // Create or get customer
    let customerId = user.publicMetadata?.stripeCustomerId as string
    if (!customerId) {
      const customer = await createCustomer(
        user.emailAddresses[0]?.emailAddress || '',
        user.firstName || user.emailAddresses[0]?.emailAddress || ''
      )
      customerId = customer.id
    }

    const session = await createCheckoutSession(
      selectedPlan.stripePriceId,
      customerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
    )

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
