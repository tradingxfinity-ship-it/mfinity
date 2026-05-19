import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { AdminService } from "@/services/admin.service";
import { getRequestContext } from "@/lib/auth/session";
import {
  successResponse,
  zodErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api";

const UpdateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  const settings = await AdminService.getPlatformSettings();
  return successResponse(settings);
}

export async function PATCH(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const body = await req.json();
    const { key, value } = UpdateSettingSchema.parse(body);
    await AdminService.updatePlatformSetting(key, value, ctx.userId);
    return successResponse(null, "Setting updated");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return serverErrorResponse();
  }
}
