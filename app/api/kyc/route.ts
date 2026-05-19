import { NextRequest } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { getRequestContext } from "@/lib/auth/session";
import { uploadRateLimit } from "@/lib/redis";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  rateLimitResponse,
  serverErrorResponse,
} from "@/lib/api";
import type { KYCDocumentType } from "@/types";

const ALLOWED_DOCUMENT_TYPES: KYCDocumentType[] = [
  "PASSPORT",
  "NATIONAL_ID",
  "DRIVERS_LICENSE",
  "SELFIE",
  "PROOF_OF_ADDRESS",
];

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const docs = await KYCService.getUserDocuments(ctx.userId);
  return successResponse(docs);
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const { success } = await uploadRateLimit.limit(ctx.userId);
  if (!success) return rateLimitResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as KYCDocumentType | null;

    if (!file) return errorResponse("No file provided", 400);
    if (!documentType || !ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return errorResponse("Invalid document type", 400);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return errorResponse("File too large (max 10MB)", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await KYCService.uploadDocument(
      ctx.userId,
      documentType,
      buffer,
      file.type
    );

    return successResponse(doc, "Document uploaded successfully", 201);
  } catch (err) {
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
