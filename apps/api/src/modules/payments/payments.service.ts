import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' as any }) : null;
  private log = new Logger(PaymentsService.name);

  // Map plan codes to Stripe price IDs (env-configured)
  private readonly PRICE_MAP: Record<string, string | undefined> = {
    plus_monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY,
    plus_yearly:  process.env.STRIPE_PRICE_PLUS_YEARLY,
    gold_monthly: process.env.STRIPE_PRICE_GOLD_MONTHLY,
    gold_yearly:  process.env.STRIPE_PRICE_GOLD_YEARLY,
    breeder_monthly: process.env.STRIPE_PRICE_BREEDER_MONTHLY,
    breeder_yearly:  process.env.STRIPE_PRICE_BREEDER_YEARLY,
  };

  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(userId: string, planCode: string) {
    if (!this.stripe) throw new BadRequestException('stripe_not_configured');
    const priceId = this.PRICE_MAP[planCode];
    if (!priceId) throw new NotFoundException('unknown_plan');
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.WEB_BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.WEB_BASE_URL}/billing/cancel`,
      client_reference_id: userId,
      metadata: { userId, planCode },
    });
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, sig: string) {
    if (!this.stripe) return { ok: true };
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      this.log.error(`Bad webhook signature: ${err.message}`);
      throw new BadRequestException('invalid_signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId;
        const planCode = s.metadata?.planCode;
        if (userId && planCode) {
          const plan = await this.prisma.subscriptionPlan.findUnique({ where: { code: planCode } });
          if (plan) {
            await this.prisma.subscription.upsert({
              where: { externalId: s.subscription as string },
              update: { status: 'ACTIVE' },
              create: {
                userId, planId: plan.id, status: 'ACTIVE',
                startedAt: new Date(), store: 'STRIPE',
                externalId: s.subscription as string,
              },
            });
            await this.prisma.user.update({ where: { id: userId }, data: { subscriptionTier: plan.tier } });
          }
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { externalId: sub.id },
          data: { status: sub.status === 'active' ? 'ACTIVE' : 'CANCELED', canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null },
        });
        break;
      }
    }
    return { received: true };
  }
}
