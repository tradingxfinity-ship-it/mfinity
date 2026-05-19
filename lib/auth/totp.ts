import speakeasy from "speakeasy";
import QRCode from "qrcode";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Mfinity";

export function generateTOTPSecret(email: string): {
  secret: string;
  otpauthUrl: string;
} {
  const generated = speakeasy.generateSecret({
    name: `${APP_NAME} (${email})`,
    issuer: APP_NAME,
    length: 32,
  });

  return {
    secret: generated.base32!,
    otpauthUrl: generated.otpauth_url!,
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTOTPToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // allow 30s window drift
  });
}
