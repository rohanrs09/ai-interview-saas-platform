import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCheckoutSession } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Get or create Stripe customer
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await createCheckoutSession(
      priceId,
      user.stripeCustomerId || undefined,
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`
    )

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    )
  }
}
