import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ForgotPasswordSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { authRateLimit } from "@/lib/redis";
import {
  successResponse,
  zodErrorResponse,
  rateLimitResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await authRateLimit.limit(`forgot:${ip}`);
  if (!success) return rateLimitResponse();

  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);
    await AuthService.forgotPassword(email);
    // Always return success to prevent email enumeration
    return successResponse(null, "If that email exists, a reset link has been sent.");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return serverErrorResponse();
  }
}
