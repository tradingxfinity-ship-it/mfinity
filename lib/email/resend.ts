import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

export const FROM_EMAIL = `${process.env.RESEND_FROM_NAME ?? "Mfinity"} <${process.env.RESEND_FROM_EMAIL ?? "noreply@mfinity.trade"}>`;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendEmailResult {
  id: string | null;
  sent: boolean;
  error?: string;
}

/**
 * Sends a transactional email. Non-throwing by design — email delivery is
 * best-effort and must never block a core flow (signup, deposits, etc.).
 * Inspect the returned `sent` flag if delivery confirmation matters.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("sendEmail error (non-fatal):", error.message);
      return { id: null, sent: false, error: error.message };
    }

    return { id: data?.id ?? null, sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("sendEmail threw (non-fatal):", message);
    return { id: null, sent: false, error: message };
  }
}
