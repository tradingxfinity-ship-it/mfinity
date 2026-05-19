import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { LoginSchema } from "@/lib/validators/auth";
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

  const { success } = await authRateLimit.limit(`login:${ip}`);
  if (!success) return rateLimitResponse();

  try {
    const body = await req.json();
    const input = LoginSchema.parse(body);

    const result = await AuthService.login(
      input,
      ip,
      req.headers.get("user-agent") ?? undefined
    );

    if (result.require2FA) {
      return successResponse({ require2FA: true, user: result.user }, "2FA required");
    }

    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);

    return successResponse({ user: result.user }, "Login successful");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 401);
    return serverErrorResponse();
  }
}
