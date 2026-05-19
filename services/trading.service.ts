import { db } from "@/lib/db";

interface PlaceOrderInput {
  userId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: number;
  marketPrice: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export const TradingService = {
  async placePaperOrder(input: PlaceOrderInput) {
    const { userId, symbol, side, quantity, marketPrice, leverage = 1, stopLoss, takeProfit } = input;

    const portfolio = await db.portfolio.findUnique({ where: { userId } });
    if (!portfolio) throw new Error("Portfolio not found");

    const notional = quantity * marketPrice;
    const margin = notional / leverage;
    const available = Number(portfolio.availableBalance);

    if (margin > available) {
      throw new Error(`Insufficient balance. Need $${margin.toFixed(2)}, available $${available.toFixed(2)}`);
    }

    const position = await db.position.create({
      data: {
        userId,
        symbol,
        exchange: "PAPER",
        side,
        status: "OPEN",
        entryPrice: marketPrice,
        currentPrice: marketPrice,
        quantity,
        leverage,
        margin,
        stopLoss: stopLoss ?? null,
        takeProfit: takeProfit ?? null,
      },
    });

    await db.portfolio.update({
      where: { userId },
      data: {
        availableBalance: { decrement: margin },
        lockedBalance: { increment: margin },
      },
    });

    return position;
  },

  async closePosition(userId: string, positionId: string, exitPrice: number) {
    const position = await db.position.findUnique({ where: { id: positionId } });
    if (!position || position.userId !== userId) throw new Error("Position not found");
    if (position.status !== "OPEN") throw new Error("Position already closed");

    const entry = Number(position.entryPrice);
    const qty = Number(position.quantity);
    const margin = Number(position.margin);

    const priceDiff = position.side === "LONG" ? exitPrice - entry : entry - exitPrice;
    const pnl = priceDiff * qty;
    const pnlPercent = (pnl / margin) * 100;
    const finalReturn = margin + pnl;

    const closed = await db.position.update({
      where: { id: positionId },
      data: {
        status: "CLOSED",
        closePrice: exitPrice,
        currentPrice: exitPrice,
        pnl,
        pnlPercent,
        closedAt: new Date(),
      },
    });

    await db.portfolio.update({
      where: { userId },
      data: {
        availableBalance: { increment: finalReturn },
        lockedBalance: { decrement: margin },
        totalPnl: { increment: pnl },
      },
    });

    return closed;
  },

  async updatePositionPrice(positionId: string, currentPrice: number) {
    const position = await db.position.findUnique({ where: { id: positionId } });
    if (!position || position.status !== "OPEN") return null;

    const entry = Number(position.entryPrice);
    const qty = Number(position.quantity);
    const margin = Number(position.margin);

    const priceDiff = position.side === "LONG" ? currentPrice - entry : entry - currentPrice;
    const pnl = priceDiff * qty;
    const pnlPercent = (pnl / margin) * 100;

    return db.position.update({
      where: { id: positionId },
      data: {
        currentPrice,
        pnl,
        pnlPercent,
      },
    });
  },

  async getPositions(userId: string, status: "OPEN" | "CLOSED" | "ALL" = "OPEN") {
    return db.position.findMany({
      where: { userId, ...(status !== "ALL" ? { status } : {}) },
      orderBy: { openedAt: "desc" },
      take: 50,
    });
  },
};
