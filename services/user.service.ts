import { db } from "@/lib/db";
import { cacheGet, cacheSet, cacheDel, CacheKeys } from "@/lib/redis";
import type { AuthUser } from "@/types";

export const UserService = {
  async getProfile(userId: string): Promise<AuthUser | null> {
    const cached = await cacheGet<AuthUser>(CacheKeys.userProfile(userId));
    if (cached) return cached;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true, portfolio: true },
    });

    if (!user) return null;

    const profile: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      subscriptionPlan: user.subscription?.plan ?? "FREE",
      availableBalance: Number(user.portfolio?.availableBalance ?? 0),
      createdAt: user.createdAt,
    };

    // Short TTL — balance moves with every trade/deposit/withdrawal.
    await cacheSet(CacheKeys.userProfile(userId), profile, 30);
    return profile;
  },

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }
  ): Promise<AuthUser> {
    const user = await db.user.update({
      where: { id: userId },
      data,
      include: { subscription: true, portfolio: true },
    });

    await cacheDel(CacheKeys.userProfile(userId));

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      subscriptionPlan: user.subscription?.plan ?? "FREE",
      availableBalance: Number(user.portfolio?.availableBalance ?? 0),
      createdAt: user.createdAt,
    };
  },

  async getPortfolio(userId: string) {
    const cached = await cacheGet(CacheKeys.userPortfolio(userId));
    if (cached) return cached;

    const portfolio = await db.portfolio.findUnique({
      where: { userId },
    });

    if (portfolio) {
      await cacheSet(CacheKeys.userPortfolio(userId), portfolio, 60);
    }

    return portfolio;
  },

  async getOpenPositions(userId: string) {
    return db.position.findMany({
      where: { userId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });
  },

  async getRecentActivity(userId: string, limit = 10) {
    return db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getNotifications(userId: string, unreadOnly = false) {
    return db.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async markNotificationRead(notificationId: string, userId: string) {
    return db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  },

  async markAllNotificationsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  async createNotification(
    userId: string,
    data: {
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    return db.notification.create({
      data: {
        userId,
        type: data.type as never,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: (data.metadata ?? null) as never,
      },
    });
  },

  async logActivity(
    userId: string,
    action: string,
    resource?: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string
  ) {
    await db.activityLog.create({
      data: { userId, action, resource, metadata: (metadata ?? null) as never, ipAddress },
    });
  },
};
