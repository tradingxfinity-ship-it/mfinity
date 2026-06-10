import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Super admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mfinity.trade";
  const adminPassword = process.env.ADMIN_SECRET ?? "Admin@123456";

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await db.user.create({
      data: {
        email: adminEmail,
        firstName: "Super",
        lastName: "Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
        kycStatus: "APPROVED",
        portfolio: { create: { availableBalance: 0 } },
        subscription: { create: { plan: "ENTERPRISE", status: "ACTIVE" } },
      },
    });

    console.log(`Created admin: ${admin.email}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  // Test trader (paper-trading account with starter balance)
  const traderEmail = process.env.TEST_TRADER_EMAIL ?? "trader@mfinity.trade";
  const traderPassword = process.env.TEST_TRADER_PASSWORD ?? "Trader@123456";

  const existingTrader = await db.user.findUnique({ where: { email: traderEmail } });

  if (!existingTrader) {
    const passwordHash = await bcrypt.hash(traderPassword, 12);

    const trader = await db.user.create({
      data: {
        email: traderEmail,
        firstName: "Test",
        lastName: "Trader",
        passwordHash,
        role: "USER",
        status: "ACTIVE",
        emailVerified: new Date(),
        kycStatus: "APPROVED",
        portfolio: { create: { availableBalance: 10000, totalValue: 10000 } },
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
      },
    });

    console.log(`Created trader: ${trader.email}`);
  } else {
    console.log("Trader already exists, skipping.");
  }

  // Default platform settings
  const defaultSettings = [
    { key: "withdrawal_fee_percent", value: 0.1 },
    { key: "min_deposit_usd", value: 10 },
    { key: "min_withdrawal_usd", value: 10 },
    { key: "kyc_required_above_usd", value: 500 },
    { key: "maintenance_mode", value: false },
    { key: "registrations_open", value: true },
    { key: "site_name", value: "Mfinity" },
    { key: "site_tagline", value: "Trade at the Speed of Light" },
  ];

  for (const setting of defaultSettings) {
    await db.platformSetting.upsert({
      where: { key: setting.key },
      create: { key: setting.key, value: setting.value as never },
      update: {},
    });
  }

  console.log("Platform settings seeded.");
  console.log("\nSeed complete!");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log("\nIMPORTANT: Change the admin password immediately after first login.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
