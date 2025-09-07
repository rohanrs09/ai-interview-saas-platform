import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
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

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  return updatedSubscription;
}

export async function getInvoices(customerId: string, limit = 10) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices;
}

export async function createPaymentIntent(amount: number, currency = 'usd', customerId?: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function getPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods;
}

export async function createSetupIntent(customerId: string) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });

  return setupIntent;
}

export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function getPlanFromPriceId(priceId: string) {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.stripePriceId === priceId) {
      return { key, plan };
    }
  }
  return null;
}
