import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { UserService } from "@/services/user.service";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
  const notifications = await UserService.getNotifications(ctx.userId, unreadOnly);
  return successResponse(notifications);
}

export async function PATCH(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await req.json();

    if (id === "all") {
      await UserService.markAllNotificationsRead(ctx.userId);
    } else {
      await UserService.markNotificationRead(id, ctx.userId);
    }

    return successResponse(null, "Notifications updated");
  } catch (err) {
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
