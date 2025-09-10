import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, subscriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkId = session.metadata?.clerkId
  const plan = session.metadata?.plan

  if (!clerkId || !plan) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Get the subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Find user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)

  if (!user.length) {
    console.error('User not found for clerkId:', clerkId)
    return
  }

  // Create subscription record
  await db.insert(subscriptions).values({
    userId: user[0].id,
    stripeSubscriptionId: stripeSubscription.id,
    plan,
    status: stripeSubscription.status as any,
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
  })

  console.log(`Subscription created for user ${clerkId} with plan ${plan}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({
      status: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({
      status: 'cancelled'
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

  console.log(`Subscription cancelled: ${subscription.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await db
      .update(subscriptions)
      .set({
        status: 'active'
      })
      .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))

    console.log(`Payment succeeded for subscription: ${invoice.subscription}`)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await db
      .update(subscriptions)
      .set({
        status: 'past_due'
      })
      .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))

    console.log(`Payment failed for subscription: ${invoice.subscription}`)
  }
}
