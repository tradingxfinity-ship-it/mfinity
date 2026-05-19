import { randomBytes } from "crypto";
import { db } from "./db";
import { addHours } from "date-fns";

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = generateSecureToken();

  await db.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt: addHours(new Date(), 24),
    },
  });

  return token;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  // Invalidate any existing tokens
  await db.passwordReset.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = generateSecureToken();

  await db.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt: addHours(new Date(), 1),
    },
  });

  return token;
}
