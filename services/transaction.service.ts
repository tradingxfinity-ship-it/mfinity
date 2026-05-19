import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import {
  depositConfirmedEmail,
  withdrawalStatusEmail,
} from "@/lib/email/templates";
import { cacheDel, CacheKeys } from "@/lib/redis";
import type { DepositInput, WithdrawalInput } from "@/lib/validators/transactions";
import { nanoid } from "nanoid";

// Platform wallet addresses per network
const PLATFORM_WALLETS: Record<string, string> = {
  BTC: process.env.WALLET_BTC ?? "bc1q_configure_in_env",
  ETH: process.env.WALLET_ETH ?? "0x_configure_in_env",
  USDT_TRC20: process.env.WALLET_TRC20 ?? "T_configure_in_env",
  USDT_ERC20: process.env.WALLET_ETH ?? "0x_configure_in_env",
  BNB: process.env.WALLET_BNB ?? "0x_configure_in_env",
  SOL: process.env.WALLET_SOL ?? "sol_configure_in_env",
};

export const TransactionService = {
  async createDeposit(userId: string, input: DepositInput) {
    const walletAddress =
      PLATFORM_WALLETS[input.network] ?? PLATFORM_WALLETS["ETH"];

    const deposit = await db.deposit.create({
      data: {
        userId,
        amount: input.amount,
        currency: input.currency,
        network: input.network,
        walletAddress,
        txHash: input.txHash,
        status: "PENDING",
      },
    });

    await db.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        status: "PENDING",
        amount: input.amount,
        currency: input.currency,
        reference: nanoid(16),
        depositId: deposit.id,
        description: `Deposit via ${input.network}`,
      },
    });

    return deposit;
  },

  async createWithdrawal(userId: string, input: WithdrawalInput) {
    const portfolio = await db.portfolio.findUnique({ where: { userId } });

    const fee = Number(input.amount) * 0.001; // 0.1% fee
    const netAmount = Number(input.amount) - fee;

    if (!portfolio || Number(portfolio.availableBalance) < Number(input.amount)) {
      throw new Error("Insufficient balance");
    }

    const withdrawal = await db.$transaction(async (tx) => {
      const w = await tx.withdrawal.create({
        data: {
          userId,
          amount: input.amount,
          fee,
          netAmount,
          currency: input.currency,
          network: input.network,
          destinationAddress: input.destinationAddress,
          status: "PENDING",
        },
      });

      await tx.portfolio.update({
        where: { userId },
        data: {
          availableBalance: { decrement: input.amount },
          lockedBalance: { increment: input.amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: input.amount,
          fee,
          currency: input.currency,
          reference: nanoid(16),
          withdrawalId: w.id,
          description: `Withdrawal to ${input.destinationAddress.slice(0, 8)}...`,
        },
      });

      return w;
    });

    await cacheDel(CacheKeys.userPortfolio(userId));
    return withdrawal;
  },

  async approveDeposit(
    depositId: string,
    adminId: string,
    note?: string
  ): Promise<void> {
    const deposit = await db.deposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) throw new Error("Deposit not found");
    if (deposit.status !== "PENDING") throw new Error("Deposit already processed");

    await db.$transaction(async (tx) => {
      await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: "COMPLETED",
          adminNote: note,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          confirmedAt: new Date(),
        },
      });

      await tx.transaction.updateMany({
        where: { depositId },
        data: { status: "COMPLETED" },
      });

      await tx.portfolio.update({
        where: { userId: deposit.userId },
        data: {
          availableBalance: { increment: deposit.amount },
          totalDeposited: { increment: deposit.amount },
          totalValue: { increment: deposit.amount },
        },
      });
    });

    await cacheDel(CacheKeys.userPortfolio(deposit.userId));

    await sendEmail({
      to: deposit.user.email,
      subject: "Deposit Confirmed",
      html: depositConfirmedEmail(
        deposit.user.firstName,
        deposit.amount.toString(),
        deposit.currency
      ),
    });
  },

  async rejectDeposit(
    depositId: string,
    adminId: string,
    note?: string
  ): Promise<void> {
    const deposit = await db.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new Error("Deposit not found");

    await db.$transaction([
      db.deposit.update({
        where: { id: depositId },
        data: {
          status: "REJECTED",
          adminNote: note,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      }),
      db.transaction.updateMany({
        where: { depositId },
        data: { status: "REJECTED" },
      }),
    ]);
  },

  async approveWithdrawal(
    withdrawalId: string,
    adminId: string,
    txHash?: string,
    note?: string
  ): Promise<void> {
    const withdrawal = await db.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) throw new Error("Withdrawal not found");
    if (withdrawal.status !== "PENDING") throw new Error("Already processed");

    await db.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "COMPLETED",
          txHash,
          adminNote: note,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          processedAt: new Date(),
        },
      });

      await tx.transaction.updateMany({
        where: { withdrawalId },
        data: { status: "COMPLETED" },
      });

      await tx.portfolio.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amount },
          totalWithdrawn: { increment: withdrawal.amount },
        },
      });
    });

    await cacheDel(CacheKeys.userPortfolio(withdrawal.userId));

    await sendEmail({
      to: withdrawal.user.email,
      subject: "Withdrawal Approved",
      html: withdrawalStatusEmail(
        withdrawal.user.firstName,
        withdrawal.amount.toString(),
        withdrawal.currency,
        "approved",
        note
      ),
    });
  },

  async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    note?: string
  ): Promise<void> {
    const withdrawal = await db.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) throw new Error("Withdrawal not found");

    await db.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          adminNote: note,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.transaction.updateMany({
        where: { withdrawalId },
        data: { status: "REJECTED" },
      });

      await tx.portfolio.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amount },
          availableBalance: { increment: withdrawal.amount },
        },
      });
    });

    await cacheDel(CacheKeys.userPortfolio(withdrawal.userId));

    await sendEmail({
      to: withdrawal.user.email,
      subject: "Withdrawal Rejected",
      html: withdrawalStatusEmail(
        withdrawal.user.firstName,
        withdrawal.amount.toString(),
        withdrawal.currency,
        "rejected",
        note
      ),
    });
  },

  async getTransactionHistory(
    userId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.transaction.count({ where: { userId } }),
    ]);

    return { items, total };
  },
};
