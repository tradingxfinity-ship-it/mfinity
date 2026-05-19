import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import { cacheGet, cacheSet, CacheKeys } from "@/lib/redis";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const cached = await cacheGet(CacheKeys.adminStats());
    if (cached) return successResponse(cached);

    const stats = await AdminService.getStats();
    await cacheSet(CacheKeys.adminStats(), stats, 120);

    return successResponse(stats);
  } catch {
    return serverErrorResponse();
  }
}
