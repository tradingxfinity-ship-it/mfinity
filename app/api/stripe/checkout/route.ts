import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import {
  stripe,
  createOrRetrieveCustomer,
  createCheckoutSession,
  PLANS,
} from "@/lib/stripe";
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
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) return unauthorizedResponse();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await createOrRetrieveCustomer(
        ctx.userId,
        user.email,
        `${user.firstName} ${user.lastName}`
      );
      await db.user.update({
        where: { id: ctx.userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const planConfig = PLANS[plan];
    const priceId =
      interval === "monthly" ? planConfig.monthlyPriceId : planConfig.yearlyPriceId;

    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: ctx.userId,
      successUrl: `${APP_URL}/dashboard/subscriptions?success=true`,
      cancelUrl: `${APP_URL}/dashboard/subscriptions?cancelled=true`,
    });

    return successResponse({ url: session.url });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
