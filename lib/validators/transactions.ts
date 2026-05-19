import { z } from "zod";

export const DepositSchema = z.object({
  amount: z.number().positive().min(10),
  currency: z.string().min(1).max(10),
  network: z.string().min(1),
  txHash: z.string().min(1).optional(),
});

export const WithdrawalSchema = z.object({
  amount: z.number().positive().min(10),
  currency: z.string().min(1).max(10),
  network: z.string().min(1),
  destinationAddress: z.string().min(10).max(200),
});

export const AdminDepositActionSchema = z.object({
  depositId: z.string().cuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
  txHash: z.string().optional(),
});

export const AdminWithdrawalActionSchema = z.object({
  withdrawalId: z.string().cuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
  txHash: z.string().optional(),
});

export type DepositInput = z.infer<typeof DepositSchema>;
export type WithdrawalInput = z.infer<typeof WithdrawalSchema>;
