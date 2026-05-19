import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const [portfolio, positions, notifications, recentTxs] = await Promise.all([
      db.portfolio.findUnique({ where: { userId: ctx.userId } }),
      db.position.findMany({ where: { userId: ctx.userId, status: "OPEN" }, orderBy: { openedAt: "desc" }, take: 5 }),
      db.notification.findMany({ where: { userId: ctx.userId, readAt: null }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.transaction.findMany({ where: { userId: ctx.userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    const stats = {
      totalValue: Number(portfolio?.totalValue ?? 0),
      totalPnl: Number(portfolio?.totalPnl ?? 0),
      totalPnlPercent: Number(portfolio?.totalPnlPercent ?? 0),
      openPositions: positions.length,
      availableBalance: Number(portfolio?.availableBalance ?? 0),
      lockedBalance: Number(portfolio?.lockedBalance ?? 0),
      winRate:
        positions.length > 0
          ? (positions.filter((p) => Number(p.pnl) > 0).length / positions.length) * 100
          : 0,
    };

    return successResponse({
      stats,
      positions,
      notifications,
      recentTransactions: recentTxs,
    });
  } catch {
    return serverErrorResponse();
  }
}
