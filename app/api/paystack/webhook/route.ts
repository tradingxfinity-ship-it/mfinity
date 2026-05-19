import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getPlanFromPlanCode } from "@/lib/paystack";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "charge.success":
      case "subscription.create": {
        await handleSubscriptionActive(event.data);
        break;
      }
      case "subscription.not_renew":
      case "subscription.disable": {
        await handleSubscriptionCancelled(event.data);
        break;
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data);
        break;
      }
    }
  } catch (err) {
    console.error("Paystack webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionActive(data: Record<string, unknown>): Promise<void> {
  const meta = data.metadata as Record<string, string> | undefined;
  const userId = meta?.userId;
  if (!userId) return;

  const sub = data.subscription as Record<string, string> | undefined;
  const plan_obj = data.plan as Record<string, string> | undefined;
  const customer = data.customer as Record<string, string> | undefined;

  const planCode = plan_obj?.plan_code ?? "";
  const plan = getPlanFromPlanCode(planCode);
  const subscriptionCode = sub?.subscription_code ?? (data.reference as string);

  await db.$transaction([
    ...(customer?.customer_code
      ? [db.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.customer_code } })]
      : []),
    db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        stripeSubscriptionId: subscriptionCode,
        stripePriceId: planCode,
      },
      update: {
        plan,
        status: "ACTIVE",
        stripeSubscriptionId: subscriptionCode,
        stripePriceId: planCode,
      },
    }),
  ]);
}

async function handleSubscriptionCancelled(data: Record<string, unknown>): Promise<void> {
  const sub = data as Record<string, string>;
  const subscriptionCode = sub.subscription_code;
  if (!subscriptionCode) return;

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionCode },
    data: { plan: "FREE", status: "CANCELLED", cancelledAt: new Date() },
  });
}

async function handlePaymentFailed(data: Record<string, unknown>): Promise<void> {
  const sub = data.subscription as Record<string, string> | undefined;
  const subscriptionCode = sub?.subscription_code;
  if (!subscriptionCode) return;

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionCode },
    data: { status: "PAST_DUE" },
  });
}
