import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const STRIPE_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 9.99,
    features: [
      '3 mock interviews per month',
      'Basic feedback reports',
      'Resume analysis',
      'Email support'
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID!,
  },
  PREMIUM: {
    name: 'Premium',
    price: 19.99,
    features: [
      'Unlimited mock interviews',
      'Detailed AI feedback reports',
      'Advanced resume analysis',
      'Voice-based interviews',
      'Progress tracking',
      'Priority support'
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 49.99,
    features: [
      'Everything in Premium',
      'Custom interview questions',
      'Team management',
      'Analytics dashboard',
      'API access',
      'Dedicated support'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
  },
};

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
}
