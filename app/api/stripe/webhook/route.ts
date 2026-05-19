import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId || !session.subscription) return;

  const priceId =
    typeof session.subscription === "string"
      ? undefined
      : (session.subscription as Stripe.Subscription).items?.data[0]?.price?.id;

  const plan = getPlanFromPriceId(priceId ?? "");

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: "ACTIVE",
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: priceId,
    },
    update: {
      plan,
      status: "ACTIVE",
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: priceId,
    },
  });
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription
): Promise<void> {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId ?? "");

  // Stripe v22 uses billing_cycle_anchor for period tracking
  const periodStart = (sub as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      plan,
      status: mapStripeStatus(sub.status),
      stripePriceId: priceId,
      ...(periodStart ? { currentPeriodStart: new Date(periodStart * 1000) } : {}),
      ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription
): Promise<void> {
  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      plan: "FREE",
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subId = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  const id = typeof subId === "string" ? subId : subId?.id;
  if (!id) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: id },
    data: { status: "PAST_DUE" },
  });
}

function getPlanFromPriceId(
  priceId: string
): "FREE" | "PRO" | "ENTERPRISE" {
  const { PLANS } = require("@/lib/stripe");
  if (
    priceId === PLANS.PRO.monthlyPriceId ||
    priceId === PLANS.PRO.yearlyPriceId
  )
    return "PRO";
  if (
    priceId === PLANS.ENTERPRISE.monthlyPriceId ||
    priceId === PLANS.ENTERPRISE.yearlyPriceId
  )
    return "ENTERPRISE";
  return "FREE";
}

function mapStripeStatus(
  status: string
): "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE" {
  const map: Record<string, "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE"> = {
    active: "ACTIVE",
    canceled: "CANCELLED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELLED",
    unpaid: "PAST_DUE",
  };
  return map[status] ?? "ACTIVE";
}
