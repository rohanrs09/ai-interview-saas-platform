import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { subscriptions, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Find user by customer ID
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.stripeCustomerId, session.customer as string))
            .limit(1)

          if (user) {
            // Create or update subscription
            await db
              .insert(subscriptions)
              .values({
                userId: user.id,
                stripeSubscriptionId: subscription.id,
                plan: subscription.metadata?.plan || 'basic',
                status: subscription.status as any,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              })
              .onConflictDoUpdate({
                target: subscriptions.stripeSubscriptionId,
                set: {
                  status: subscription.status as any,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  updatedAt: new Date(),
                },
              })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await db
          .update(subscriptions)
          .set({
            status: subscription.status as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await db
          .update(subscriptions)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          await db
            .update(subscriptions)
            .set({
              status: 'past_due',
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
