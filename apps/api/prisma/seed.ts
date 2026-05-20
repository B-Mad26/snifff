import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ---- seed subscription plans ----
  const plans = [
    { code: 'plus_monthly',  tier: SubscriptionTier.PLUS,        priceCents: 999,   billingCycle: 'monthly' },
    { code: 'plus_yearly',   tier: SubscriptionTier.PLUS,        priceCents: 6999,  billingCycle: 'yearly'  },
    { code: 'gold_monthly',  tier: SubscriptionTier.GOLD,        priceCents: 1999,  billingCycle: 'monthly' },
    { code: 'gold_yearly',   tier: SubscriptionTier.GOLD,        priceCents: 14999, billingCycle: 'yearly'  },
    { code: 'breeder_monthly', tier: SubscriptionTier.BREEDER_PRO, priceCents: 3999, billingCycle: 'monthly' },
    { code: 'breeder_yearly',  tier: SubscriptionTier.BREEDER_PRO, priceCents: 29900, billingCycle: 'yearly' },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: { ...p, currency: 'USD' },
      create: { ...p, currency: 'USD' },
    });
  }
  // eslint-disable-next-line no-console
  console.log('✓ Seeded subscription plans');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
