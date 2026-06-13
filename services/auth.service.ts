import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateTokenPair } from "@/lib/auth/jwt";
import { createVerificationToken, createPasswordResetToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email/resend";
import {
  welcomeEmail,
  verifyEmailTemplate,
  passwordResetEmail,
} from "@/lib/email/templates";
import { addDays } from "date-fns";
import type { SignupInput, LoginInput } from "@/lib/validators/auth";
import type { AuthTokens, AuthUser } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mfinity.trade";

export const AuthService = {
  async signup(
    input: SignupInput,
    ipAddress?: string
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error("Email already registered");

    const passwordHash = await hashPassword(input.password);

    const user = await db.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
        portfolio: { create: { availableBalance: 0, totalValue: 0 } },
        subscription: { create: { plan: "FREE" } },
      },
    });

    const verifyToken = await createVerificationToken(user.id);
    const verifyUrl = `${APP_URL}/verify-email?token=${verifyToken}`;

    // Email send is best-effort — a failure (e.g. unverified domain) must not
    // block account creation.
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Mfinity — Verify your email",
        html: welcomeEmail(user.firstName, verifyUrl),
      });
    } catch (err) {
      console.error("Welcome email failed (non-fatal):", err);
    }

    const session = await db.session.create({
      data: {
        userId: user.id,
        refreshToken: crypto.randomUUID(),
        ipAddress,
        expiresAt: addDays(new Date(), 7),
      },
    });

    const tokens = await generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    await db.session.update({
      where: { id: session.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { user: toAuthUser(user, "FREE"), tokens };
  },

  async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: AuthUser; tokens: AuthTokens; require2FA?: boolean }> {
    const user = await db.user.findUnique({
      where: { email: input.email },
      include: { subscription: true },
    });

    if (!user) throw new Error("Invalid credentials");
    if (user.status === "BANNED") throw new Error("Account banned");
    if (user.status === "SUSPENDED") throw new Error("Account suspended");

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    if (user.twoFactorEnabled) {
      if (!input.totpToken) {
        return { user: toAuthUser(user, user.subscription?.plan ?? "FREE"), tokens: {} as AuthTokens, require2FA: true };
      }

      const { verifyTOTPToken } = await import("@/lib/auth/totp");
      const ok = verifyTOTPToken(user.twoFactorSecret!, input.totpToken);
      if (!ok) throw new Error("Invalid 2FA code");
    }

    const session = await db.session.create({
      data: {
        userId: user.id,
        refreshToken: crypto.randomUUID(),
        ipAddress,
        userAgent,
        expiresAt: addDays(new Date(), 7),
      },
    });

    const tokens = await generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    await db.session.update({
      where: { id: session.id },
      data: { refreshToken: tokens.refreshToken },
    });

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    });

    return { user: toAuthUser(user, user.subscription?.plan ?? "FREE"), tokens };
  },

  async verifyEmail(token: string): Promise<void> {
    const record = await db.verificationToken.findUnique({ where: { token } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired token");
    }

    await db.$transaction([
      db.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: record.userId },
        data: {
          emailVerified: new Date(),
          status: "ACTIVE",
        },
      }),
    ]);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return; // silently return to prevent user enumeration

    const resetToken = await createPasswordResetToken(user.id);
    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Mfinity — Reset your password",
      html: passwordResetEmail(resetUrl),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await db.passwordReset.findUnique({ where: { token } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired reset link");
    }

    const passwordHash = await hashPassword(newPassword);

    await db.$transaction([
      db.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      // Revoke all sessions for security
      db.session.updateMany({
        where: { userId: record.userId },
        data: { revokedAt: new Date() },
      }),
    ]);
  },

  async resendVerification(userId: string): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return;

    const verifyToken = await createVerificationToken(user.id);
    const verifyUrl = `${APP_URL}/verify-email?token=${verifyToken}`;

    await sendEmail({
      to: user.email,
      subject: "Mfinity — Verify your email",
      html: verifyEmailTemplate(verifyUrl),
    });
  },
};

function toAuthUser(
  user: { id: string; email: string; firstName: string; lastName: string; role: string; status: string; kycStatus: string; twoFactorEnabled: boolean; emailVerified: Date | null; avatarUrl: string | null; createdAt: Date },
  plan: string
): AuthUser {
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
    subscriptionPlan: plan,
    // Balance isn't returned by signup/login responses (the dashboard layout
    // re-fetches it via /api/user/profile right after auth). Default to 0
    // here to satisfy the AuthUser contract without an extra portfolio query
    // on the hot path.
    availableBalance: 0,
    createdAt: user.createdAt,
  };
}
