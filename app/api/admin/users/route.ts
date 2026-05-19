import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { AdminService } from "@/services/admin.service";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const { page, limit } = getPaginationParams(req.nextUrl);
    const search = req.nextUrl.searchParams.get("search") ?? undefined;

    const { items, total } = await AdminService.getUsers(page, limit, search);

    return successResponse({
      items: items.map((u) => ({ ...u, passwordHash: undefined })),
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch {
    return serverErrorResponse();
  }
}
