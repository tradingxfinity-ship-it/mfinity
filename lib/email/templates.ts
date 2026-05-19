const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Mfinity";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mfinity.trade";

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0A0A0F;
  color: #ffffff;
  padding: 40px 20px;
`;

const cardStyle = `
  max-width: 560px;
  margin: 0 auto;
  background: #0F0F1A;
  border: 1px solid #1E1E2E;
  border-radius: 16px;
  overflow: hidden;
`;

const headerStyle = `
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  padding: 32px;
  text-align: center;
`;

const bodyStyle = `padding: 32px;`;

const btnStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: #ffffff;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  margin: 24px 0;
`;

const footerStyle = `
  padding: 24px 32px;
  border-top: 1px solid #1E1E2E;
  color: #6B7280;
  font-size: 12px;
  text-align: center;
`;

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff">${APP_NAME}</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px">AI-Powered Crypto Trading</p>
    </div>
    <div style="${bodyStyle}">${content}</div>
    <div style="${footerStyle}">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/privacy" style="color:#6B7280">Privacy</a> · <a href="${APP_URL}/terms" style="color:#6B7280">Terms</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(firstName: string, verifyUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">Welcome to ${APP_NAME}, ${firstName}!</h2>
    <p style="color:#9CA3AF;margin:0 0 24px">You're almost ready to start trading smarter. Verify your email to activate your account.</p>
    <div style="text-align:center">
      <a href="${verifyUrl}" style="${btnStyle}">Verify Email Address</a>
    </div>
    <p style="color:#6B7280;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  `);
}

export function verifyEmailTemplate(verifyUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">Verify your email</h2>
    <p style="color:#9CA3AF;margin:0 0 24px">Click the button below to verify your email address.</p>
    <div style="text-align:center">
      <a href="${verifyUrl}" style="${btnStyle}">Verify Email</a>
    </div>
    <p style="color:#6B7280;font-size:13px">Or paste this link: <span style="color:#3B82F6">${verifyUrl}</span></p>
    <p style="color:#6B7280;font-size:13px">Expires in 24 hours.</p>
  `);
}

export function passwordResetEmail(resetUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">Reset your password</h2>
    <p style="color:#9CA3AF;margin:0 0 24px">We received a request to reset your password. Click below to create a new one.</p>
    <div style="text-align:center">
      <a href="${resetUrl}" style="${btnStyle}">Reset Password</a>
    </div>
    <p style="color:#6B7280;font-size:13px">This link expires in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `);
}

export function depositConfirmedEmail(
  firstName: string,
  amount: string,
  currency: string
): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">Deposit Confirmed ✓</h2>
    <p style="color:#9CA3AF;margin:0 0 24px">Hi ${firstName}, your deposit has been confirmed and added to your account.</p>
    <div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:8px;padding:20px;margin:0 0 24px">
      <p style="margin:0;color:#9CA3AF;font-size:13px">Amount Deposited</p>
      <p style="margin:4px 0 0;color:#10B981;font-size:28px;font-weight:700">${amount} ${currency}</p>
    </div>
    <div style="text-align:center">
      <a href="${APP_URL}/dashboard" style="${btnStyle}">View Dashboard</a>
    </div>
  `);
}

export function withdrawalStatusEmail(
  firstName: string,
  amount: string,
  currency: string,
  status: "approved" | "rejected",
  note?: string
): string {
  const isApproved = status === "approved";
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">
      Withdrawal ${isApproved ? "Approved ✓" : "Rejected ✗"}
    </h2>
    <p style="color:#9CA3AF;margin:0 0 24px">Hi ${firstName}, your withdrawal request has been ${status}.</p>
    <div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:8px;padding:20px;margin:0 0 24px">
      <p style="margin:0;color:#9CA3AF;font-size:13px">Amount</p>
      <p style="margin:4px 0 0;color:${isApproved ? "#10B981" : "#EF4444"};font-size:28px;font-weight:700">${amount} ${currency}</p>
      ${note ? `<p style="margin:12px 0 0;color:#6B7280;font-size:13px">Note: ${note}</p>` : ""}
    </div>
    <div style="text-align:center">
      <a href="${APP_URL}/dashboard/withdrawals" style="${btnStyle}">View Details</a>
    </div>
  `);
}

export function kycStatusEmail(
  firstName: string,
  status: "approved" | "rejected",
  note?: string
): string {
  const isApproved = status === "approved";
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">
      KYC Verification ${isApproved ? "Approved ✓" : "Rejected ✗"}
    </h2>
    <p style="color:#9CA3AF;margin:0 0 24px">
      Hi ${firstName}, your identity verification has been ${isApproved ? "approved. You now have full access to all platform features." : "rejected."}.
    </p>
    ${note ? `<div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:8px;padding:20px;margin:0 0 24px"><p style="margin:0;color:#9CA3AF;font-size:13px">Reason: ${note}</p></div>` : ""}
    <div style="text-align:center">
      <a href="${APP_URL}/dashboard/kyc" style="${btnStyle}">
        ${isApproved ? "Go to Dashboard" : "Resubmit Documents"}
      </a>
    </div>
  `);
}

export function broadcastEmail(subject: string, body: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px">${subject}</h2>
    <div style="color:#9CA3AF;line-height:1.6">${body}</div>
    <div style="text-align:center;margin-top:32px">
      <a href="${APP_URL}/dashboard" style="${btnStyle}">Open Dashboard</a>
    </div>
  `);
}
