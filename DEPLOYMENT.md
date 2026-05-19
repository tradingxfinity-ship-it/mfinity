# Mfinity — Production Deployment Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ (via Supabase)
- Accounts: Supabase, Upstash, Resend, Stripe, Cloudinary

---

## 1. Database Setup (Supabase)

1. Create project at supabase.com
2. Go to Settings → Database → Connection string (copy both URI and direct URL)
3. Enable Realtime on tables: `notifications`, `portfolios`
   - Supabase Dashboard → Database → Replication → check those tables

---

## 2. Run Migrations

```bash
# Set env vars first
cp .env.example .env.local
# Fill in DATABASE_URL and DIRECT_URL

npm run db:migrate   # runs prisma migrate dev
npm run db:seed      # creates super admin + platform settings
```

---

## 3. External Services

### Upstash Redis
1. Create database at upstash.com → Redis
2. Copy REST URL and Token to `.env.local`

### Resend
1. Create account at resend.com
2. Add and verify your domain (mfinity.trade)
3. Create API key → copy to `.env.local`

### Stripe
1. Create account at stripe.com
2. Create 4 products with monthly/yearly prices:
   - Pro Monthly ($49/mo), Pro Yearly ($490/yr)
   - Enterprise Monthly ($199/mo), Enterprise Yearly ($1990/yr)
3. Copy price IDs to `.env.local`
4. Add webhook endpoint: `https://mfinity.trade/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Cloudinary
1. Create account at cloudinary.com
2. Copy cloud name, API key, and API secret to `.env.local`

---

## 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Add all environment variables
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
# ... repeat for all vars in .env.example

# Deploy
vercel --prod
```

Or use the Vercel dashboard → Import Git Repository → add env vars → Deploy.

---

## 5. Post-Deploy Checklist

- [ ] Visit `https://your-domain.com/login` — can login as admin
- [ ] Verify email sending works (test signup)
- [ ] Stripe webhook registered and receiving events
- [ ] Supabase realtime channels active
- [ ] Redis connection working (check logs for Upstash errors)
- [ ] KYC uploads working (Cloudinary)
- [ ] Change admin password immediately

---

## 6. Folder Structure

```
/
├── app/
│   ├── (auth)/              # login, signup, forgot-password, reset-password, verify-email
│   ├── (dashboard)/         # user dashboard, deposits, withdrawals, kyc, settings, subscriptions
│   ├── (admin)/             # admin panel: users, deposits, withdrawals, kyc, broadcast, settings
│   └── api/
│       ├── auth/            # signup, login, logout, refresh, verify-email, forgot-password, reset-password, 2fa/
│       ├── user/            # profile, dashboard, notifications
│       ├── deposits/        # user deposit CRUD
│       ├── withdrawals/     # user withdrawal CRUD
│       ├── transactions/    # transaction history
│       ├── kyc/             # KYC document upload
│       ├── exchanges/       # connect/disconnect exchanges
│       ├── stripe/          # checkout, webhook, portal
│       └── admin/           # stats, users, deposits, withdrawals, kyc, broadcast, settings
├── components/              # existing landing page components
├── hooks/                   # useAuth, usePortfolio, useRealtimeNotifications
├── lib/
│   ├── auth/                # jwt.ts, password.ts, session.ts, totp.ts
│   ├── email/               # resend.ts, templates.ts
│   ├── validators/          # auth.ts, transactions.ts
│   ├── api.ts               # response helpers
│   ├── cloudinary.ts
│   ├── db.ts
│   ├── redis.ts
│   ├── stripe.ts
│   ├── supabase.ts
│   └── tokens.ts
├── prisma/
│   ├── schema.prisma        # 20+ models
│   └── seed.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── transaction.service.ts
│   ├── kyc.service.ts
│   ├── admin.service.ts
│   └── exchange.service.ts
├── types/
│   └── index.ts
├── middleware.ts             # JWT auth + role checks + security headers
├── prisma.config.ts
├── vercel.json
└── .env.example
```

---

## 7. GitHub Push

```bash
git add .
git commit -m "feat: complete production backend — auth, dashboard, admin, deposits, withdrawals, KYC, Stripe, realtime"
git push origin main
```

---

## 8. Admin Access

After deploy + seed:
- URL: `https://mfinity.trade/admin`
- Email: value of `ADMIN_EMAIL` env var (default: `admin@mfinity.trade`)
- Password: value of `ADMIN_SECRET` env var (default: `Admin@123456`)
- **Change immediately after first login**
