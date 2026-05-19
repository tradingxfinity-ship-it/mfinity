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

const BroadcastSchema = z.object({
  subject: z.string().min(5).max(200),
  body: z.string().min(20).max(5000),
  targetGroup: z.enum(["ALL", "PRO", "ENTERPRISE"]).default("ALL"),
});

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const body = await req.json();
    const { subject, body: emailBody, targetGroup } = BroadcastSchema.parse(body);

    const { sentCount } = await AdminService.sendBroadcast(
      ctx.userId,
      subject,
      emailBody,
      targetGroup
    );

    return successResponse({ sentCount }, `Broadcast sent to ${sentCount} users`);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return serverErrorResponse();
  }
}
