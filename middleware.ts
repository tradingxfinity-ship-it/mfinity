import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const ADMIN_PATHS = ["/admin", "/api/admin"];
const AUTH_PATHS = ["/dashboard", "/portfolio", "/deposits", "/withdrawals", "/kyc", "/settings", "/subscriptions"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/api/auth/") || pathname.startsWith("/_next/") || pathname.startsWith("/public/")
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

function isProtectedPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, public API, and public pages
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Security headers on all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (isPublicPath(pathname)) {
    return response;
  }

  // Extract access token from cookie
  const accessToken = request.cookies.get("mfinity_access")?.value;

  if (!accessToken) {
    if (isProtectedPath(pathname) || isAdminPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  try {
    const payload = await verifyAccessToken(accessToken);

    // Admin route protection
    if (isAdminPath(pathname)) {
      if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Inject user context via headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-session-id", payload.sessionId);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token expired or invalid
    if (isProtectedPath(pathname) || isAdminPath(pathname)) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete("mfinity_access");
      return res;
    }
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
