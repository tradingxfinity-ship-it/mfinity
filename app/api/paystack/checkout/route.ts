import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { PLANS, initializeTransaction } from "@/lib/paystack";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mfinity.trade";

const CheckoutSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "yearly"]),
});

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { plan, interval } = CheckoutSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) return unauthorizedResponse();

    const planConfig = PLANS[plan];
    const planCode =
      interval === "monthly" ? planConfig.monthlyPlanCode : planConfig.yearlyPlanCode;

    const tx = await initializeTransaction({
      email: user.email,
      planCode,
      userId: ctx.userId,
      callbackUrl: `${APP_URL}/dashboard/subscriptions?verified=true`,
    });

    return successResponse({ url: tx.authorization_url });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
