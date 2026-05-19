import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiSuccess, ApiError } from "@/types";

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error, code, details }, { status });
}

export function zodErrorResponse(err: ZodError): NextResponse<ApiError> {
  const details: Record<string, string[]> = {};
  err.issues.forEach((e) => {
    const key = e.path.join(".");
    if (!details[key]) details[key] = [];
    details[key].push(e.message);
  });
  return errorResponse("Validation failed", 422, "VALIDATION_ERROR", details);
}

export function unauthorizedResponse(
  message = "Unauthorized"
): NextResponse<ApiError> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

export function forbiddenResponse(
  message = "Forbidden"
): NextResponse<ApiError> {
  return errorResponse(message, 403, "FORBIDDEN");
}

export function notFoundResponse(
  resource = "Resource"
): NextResponse<ApiError> {
  return errorResponse(`${resource} not found`, 404, "NOT_FOUND");
}

export function rateLimitResponse(): NextResponse<ApiError> {
  return errorResponse("Too many requests", 429, "RATE_LIMITED");
}

export function serverErrorResponse(
  message = "Internal server error"
): NextResponse<ApiError> {
  return errorResponse(message, 500, "SERVER_ERROR");
}

export function getPaginationParams(url: URL): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
