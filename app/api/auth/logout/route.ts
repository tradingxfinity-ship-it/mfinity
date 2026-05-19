import { NextRequest } from "next/server";
import { clearAuthCookies, getRefreshToken, revokeSession } from "@/lib/auth/session";
import { successResponse, serverErrorResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await revokeSession(refreshToken);
    }
    await clearAuthCookies();
    return successResponse(null, "Logged out successfully");
  } catch {
    return serverErrorResponse();
  }
}
