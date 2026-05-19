import { NextRequest } from "next/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mfinity.trade";

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const user = await db.user.findUnique({
    where: { id: ctx.userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return errorResponse("No billing account found", 400);
  }

  try {
    const session = await createBillingPortalSession(
      user.stripeCustomerId,
      `${APP_URL}/dashboard/subscriptions`
    );
    return successResponse({ url: session.url });
  } catch {
    return serverErrorResponse();
  }
}
