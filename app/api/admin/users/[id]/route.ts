import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { getRequestContext } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import { db } from "@/lib/db";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api";

const ActionSchema = z.object({
  action: z.enum(["suspend", "ban", "restore", "change_role"]),
  reason: z.string().max(500).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      portfolio: true,
      kycDocuments: { orderBy: { createdAt: "desc" } },
      deposits: { orderBy: { createdAt: "desc" }, take: 10 },
      withdrawals: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { deposits: true, withdrawals: true, positions: true } },
    },
  });

  if (!user) return notFoundResponse("User");

  const { passwordHash, twoFactorSecret, ...safeUser } = user;
  return successResponse(safeUser);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const { action, reason, role } = ActionSchema.parse(body);
    const ip = req.headers.get("x-forwarded-for") ?? undefined;

    switch (action) {
      case "suspend":
        await AdminService.suspendUser(id, ctx.userId, reason);
        break;
      case "ban":
        await AdminService.banUser(id, ctx.userId, reason);
        break;
      case "restore":
        await AdminService.restoreUser(id, ctx.userId);
        break;
      case "change_role":
        if (!role) return errorResponse("Role is required", 400);
        await db.user.update({ where: { id }, data: { role } });
        await AdminService.logAdminAction(ctx.userId, "ROLE_CHANGED", id, { role }, ip);
        break;
    }

    return successResponse(null, `User ${action} successful`);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
