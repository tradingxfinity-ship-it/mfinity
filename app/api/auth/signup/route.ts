import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { SignupSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { setAuthCookies } from "@/lib/auth/session";
import { authRateLimit } from "@/lib/redis";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  rateLimitResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { success } = await authRateLimit.limit(ip);
  if (!success) return rateLimitResponse();

  try {
    const body = await req.json();
    const input = SignupSchema.parse(body);

    const { user, tokens } = await AuthService.signup(input, ip);
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return successResponse({ user }, "Account created successfully", 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
