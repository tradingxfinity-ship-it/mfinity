import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

// Lazy proxy
export const stripe = new Proxy({} as Stripe, {
  get: (_, prop) => (getStripe() as never)[prop as never],
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["1 exchange connection", "Basic analytics", "5 active positions", "Email support"],
  },
  PRO: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_pro_monthly",
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "price_pro_yearly",
    features: ["3 exchange connections", "Advanced analytics", "Unlimited positions", "AI signals", "Priority support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? "price_ent_monthly",
    yearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID ?? "price_ent_yearly",
    features: ["Unlimited connections", "Full analytics suite", "Custom strategies", "API access", "Dedicated support"],
  },
} as const;

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const s = getStripe();
  const existing = await s.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });

  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await s.customers.create({ email, name, metadata: { userId } });
  return customer.id;
}

export async function createCheckoutSession(options: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    customer: options.customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: options.priceId, quantity: 1 }],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: { userId: options.userId },
    subscription_data: { metadata: { userId: options.userId } },
    allow_promotion_codes: true,
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
