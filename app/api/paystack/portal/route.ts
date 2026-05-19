import { NextRequest } from "next/server";
import { getSubscriptionManageLink } from "@/lib/paystack";
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

  const subscription = await db.subscription.findUnique({
    where: { userId: ctx.userId },
    select: { stripeSubscriptionId: true },
  });

  if (!subscription?.stripeSubscriptionId) {
    return errorResponse("No active subscription found", 400);
  }

  try {
    const link = await getSubscriptionManageLink(subscription.stripeSubscriptionId);
    return successResponse({ url: link });
  } catch {
    return serverErrorResponse();
  }
}
