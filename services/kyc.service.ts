import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendEmail } from "@/lib/email/resend";
import { kycStatusEmail } from "@/lib/email/templates";
import { cacheDel, CacheKeys } from "@/lib/redis";
import type { KYCDocumentType } from "@/types";

export const KYCService = {
  async uploadDocument(
    userId: string,
    documentType: KYCDocumentType,
    fileBuffer: Buffer,
    mimeType: string
  ) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(mimeType)) {
      throw new Error("Invalid file type. Allowed: JPG, PNG, WEBP, PDF");
    }

    const { publicId, secureUrl } = await uploadToCloudinary(fileBuffer, {
      folder: `kyc/${userId}`,
      allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"],
    });

    const doc = await db.kYCDocument.create({
      data: {
        userId,
        documentType,
        cloudinaryId: publicId,
        cloudinaryUrl: secureUrl,
        status: "PENDING",
      },
    });

    await db.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    });

    await cacheDel(CacheKeys.userProfile(userId));
    return doc;
  },

  async getUserDocuments(userId: string) {
    return db.kYCDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async approveKYC(
    userId: string,
    adminId: string,
    note?: string
  ): Promise<void> {
    await db.$transaction([
      db.kYCDocument.updateMany({
        where: { userId, status: "PENDING" },
        data: {
          status: "APPROVED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          adminNote: note,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { kycStatus: "APPROVED" },
      }),
    ]);

    await cacheDel(CacheKeys.userProfile(userId));

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendEmail({
        to: user.email,
        subject: "KYC Verification Approved",
        html: kycStatusEmail(user.firstName, "approved", note),
      });
    }
  },

  async rejectKYC(
    userId: string,
    adminId: string,
    note: string
  ): Promise<void> {
    await db.$transaction([
      db.kYCDocument.updateMany({
        where: { userId, status: "PENDING" },
        data: {
          status: "REJECTED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          adminNote: note,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { kycStatus: "REJECTED" },
      }),
    ]);

    await cacheDel(CacheKeys.userProfile(userId));

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendEmail({
        to: user.email,
        subject: "KYC Verification Update",
        html: kycStatusEmail(user.firstName, "rejected", note),
      });
    }
  },

  async getPendingKYC(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.user.findMany({
        where: { kycStatus: "PENDING" },
        include: { kycDocuments: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      db.user.count({ where: { kycStatus: "PENDING" } }),
    ]);

    return { items, total };
  },
};
