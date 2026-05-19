import crypto from "crypto";

const BASE = "https://api.paystack.co";

function secretKey() {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

async function call<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack request failed");
  return json.data as T;
}

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["1 exchange connection", "Basic analytics", "5 active positions", "Email support"],
  },
  PRO: {
    name: "Pro",
    monthlyPlanCode: process.env.PAYSTACK_PRO_MONTHLY_PLAN_CODE ?? "plan_pro_monthly",
    yearlyPlanCode: process.env.PAYSTACK_PRO_YEARLY_PLAN_CODE ?? "plan_pro_yearly",
    features: ["3 exchange connections", "Advanced analytics", "Unlimited positions", "AI signals", "Priority support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPlanCode: process.env.PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE ?? "plan_ent_monthly",
    yearlyPlanCode: process.env.PAYSTACK_ENTERPRISE_YEARLY_PLAN_CODE ?? "plan_ent_yearly",
    features: ["Unlimited connections", "Full analytics suite", "Custom strategies", "API access", "Dedicated support"],
  },
} as const;

export async function createOrRetrieveCustomer(email: string, name: string): Promise<string> {
  try {
    const existing = await call<{ customer_code: string }[]>("GET", `/customer?email=${encodeURIComponent(email)}`);
    if (Array.isArray(existing) && existing.length > 0) return existing[0].customer_code;
  } catch {}

  const customer = await call<{ customer_code: string }>("POST", "/customer", {
    email,
    full_name: name,
  });
  return customer.customer_code;
}

export async function initializeTransaction(options: {
  email: string;
  planCode: string;
  userId: string;
  callbackUrl: string;
}): Promise<{ authorization_url: string; reference: string }> {
  return call("POST", "/transaction/initialize", {
    email: options.email,
    amount: 100,
    plan: options.planCode,
    metadata: { userId: options.userId },
    callback_url: options.callbackUrl,
  });
}

interface PaystackTransaction {
  status: string;
  metadata: { userId?: string };
  plan?: { plan_code: string };
  subscription?: { subscription_code: string };
  customer: { customer_code: string };
}

export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  return call("GET", `/transaction/verify/${reference}`);
}

export async function getSubscriptionManageLink(subscriptionCode: string): Promise<string> {
  const data = await call<{ link: string }>("GET", `/subscription/${subscriptionCode}/manage/link`);
  return data.link;
}

export function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !secretKey()) return false;
  const hash = crypto.createHmac("sha512", secretKey()).update(body).digest("hex");
  return hash === signature;
}

export function getPlanFromPlanCode(planCode: string): "FREE" | "PRO" | "ENTERPRISE" {
  if (planCode === PLANS.PRO.monthlyPlanCode || planCode === PLANS.PRO.yearlyPlanCode) return "PRO";
  if (planCode === PLANS.ENTERPRISE.monthlyPlanCode || planCode === PLANS.ENTERPRISE.yearlyPlanCode) return "ENTERPRISE";
  return "FREE";
}
