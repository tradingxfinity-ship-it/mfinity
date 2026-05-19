import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { getRequestContext } from "@/lib/auth/session";
import { UserService } from "@/services/user.service";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api";

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const profile = await UserService.getProfile(ctx.userId);
  if (!profile) return notFoundResponse("User");

  return successResponse(profile);
}

export async function PATCH(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const data = UpdateProfileSchema.parse(body);
    const profile = await UserService.updateProfile(ctx.userId, data);
    return successResponse(profile, "Profile updated");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
