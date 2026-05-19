import { NextRequest } from "next/server";
import { verifyTransaction, getPlanFromPlanCode } from "@/lib/paystack";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const { reference } = await req.json();
    if (!reference) return errorResponse("Missing reference", 400);

    const tx = await verifyTransaction(reference);

    if (tx.status !== "success") return errorResponse("Payment not successful", 400);
    if (tx.metadata?.userId !== ctx.userId) return errorResponse("User mismatch", 403);

    const plan = getPlanFromPlanCode(tx.plan?.plan_code ?? "");
    const subscriptionCode = tx.subscription?.subscription_code ?? reference;
    const planCode = tx.plan?.plan_code;

    await db.$transaction([
      db.user.update({
        where: { id: ctx.userId },
        data: { stripeCustomerId: tx.customer.customer_code },
      }),
      db.subscription.upsert({
        where: { userId: ctx.userId },
        create: {
          userId: ctx.userId,
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

    return successResponse({ plan });
  } catch (err) {
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
