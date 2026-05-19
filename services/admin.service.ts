import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import { broadcastEmail } from "@/lib/email/templates";
import { cacheDel, CacheKeys } from "@/lib/redis";
import type { AdminLogAction } from "@prisma/client";

export const AdminService = {
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      pendingWithdrawals,
      depositStats,
      withdrawalStats,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: "ACTIVE" } }),
      db.user.count({ where: { kycStatus: "PENDING" } }),
      db.withdrawal.count({ where: { status: "PENDING" } }),
      db.deposit.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      db.withdrawal.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingKYC,
      pendingWithdrawals,
      totalDeposits: Number(depositStats._sum.amount ?? 0),
      totalWithdrawals: Number(withdrawalStats._sum.amount ?? 0),
    };
  },

  async getUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          subscription: true,
          portfolio: true,
          _count: { select: { deposits: true, withdrawals: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return { items, total };
  },

  async suspendUser(
    targetId: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    await db.$transaction([
      db.user.update({
        where: { id: targetId },
        data: { status: "SUSPENDED" },
      }),
      db.adminLog.create({
        data: {
          actorId: adminId,
          targetId,
          action: "USER_SUSPENDED",
          details: { reason },
        },
      }),
    ]);

    await cacheDel(CacheKeys.userProfile(targetId));
  },

  async banUser(
    targetId: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    await db.$transaction([
      db.user.update({
        where: { id: targetId },
        data: { status: "BANNED" },
      }),
      db.session.updateMany({
        where: { userId: targetId },
        data: { revokedAt: new Date() },
      }),
      db.adminLog.create({
        data: {
          actorId: adminId,
          targetId,
          action: "USER_BANNED",
          details: { reason },
        },
      }),
    ]);

    await cacheDel(CacheKeys.userProfile(targetId));
  },

  async restoreUser(targetId: string, adminId: string): Promise<void> {
    await db.$transaction([
      db.user.update({
        where: { id: targetId },
        data: { status: "ACTIVE" },
      }),
      db.adminLog.create({
        data: {
          actorId: adminId,
          targetId,
          action: "USER_RESTORED",
        },
      }),
    ]);

    await cacheDel(CacheKeys.userProfile(targetId));
  },

  async sendBroadcast(
    adminId: string,
    subject: string,
    body: string,
    targetGroup: "ALL" | "PRO" | "ENTERPRISE" = "ALL"
  ): Promise<{ sentCount: number }> {
    const where =
      targetGroup === "ALL"
        ? { status: "ACTIVE" as const }
        : {
            status: "ACTIVE" as const,
            subscription: { plan: targetGroup },
          };

    const users = await db.user.findMany({
      where,
      select: { email: true },
    });

    const BATCH_SIZE = 50;
    let sentCount = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const emails = batch.map((u) => u.email);

      try {
        await sendEmail({
          to: emails,
          subject,
          html: broadcastEmail(subject, body),
        });
        sentCount += emails.length;
      } catch {
        // log and continue
      }
    }

    await db.broadcast.create({
      data: { subject, body, sentBy: adminId, sentTo: targetGroup, sentCount },
    });

    return { sentCount };
  },

  async getPlatformSettings(): Promise<Record<string, unknown>> {
    const settings = await db.platformSetting.findMany();
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  },

  async updatePlatformSetting(
    key: string,
    value: unknown,
    adminId: string
  ): Promise<void> {
    await db.platformSetting.upsert({
      where: { key },
      create: { key, value: value as never, updatedBy: adminId },
      update: { value: value as never, updatedBy: adminId },
    });

    await cacheDel(CacheKeys.platformSettings());
  },

  async logAdminAction(
    actorId: string,
    action: AdminLogAction,
    targetId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string
  ): Promise<void> {
    await db.adminLog.create({
      data: { actorId, targetId, action, details: (details ?? null) as never, ipAddress },
    });
  },

  async getAdminLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.adminLog.findMany({
        include: {
          actor: { select: { firstName: true, lastName: true, email: true } },
          target: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.adminLog.count(),
    ]);

    return { items, total };
  },
};
