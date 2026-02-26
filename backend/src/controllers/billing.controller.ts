import { Request, Response } from 'express';
import stripe from '../config/stripe';
import config from '../config/env';
import { UserModel } from '../models/user.model';
import { PlanModel } from '../models/plan.model';
import { SubscriptionModel } from '../models/subscription.model';
import { UsageModel } from '../models/usage.model';

export class BillingController {
  /**
   * GET /api/billing/plans - Public
   */
  static async getPlans(_req: Request, res: Response): Promise<void> {
    try {
      const plans = await PlanModel.findAll();

      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceUsdCents: plan.price_usd_cents,
        priceInrCents: plan.price_inr_cents,
        maxLinksPerMonth: plan.max_links_per_month,
        analyticsRetentionDays: plan.analytics_retention_days,
        customDomains: plan.custom_domains,
        passwordProtectedLinks: plan.password_protected_links,
        customQrCodes: plan.custom_qr_codes,
        csvExport: plan.csv_export,
        apiRateLimit: plan.api_rate_limit,
      }));

      res.json({ success: true, data: { plans: formattedPlans } });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch plans' },
      });
    }
  }

  /**
   * GET /api/billing/subscription - Requires auth
   */
  static async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      const plan = await PlanModel.findById(user.plan || 'free');
      const subscription = await SubscriptionModel.findActiveByUserId(userId);
      const usage = await UsageModel.getCurrentPeriodUsage(userId);

      res.json({
        success: true,
        data: {
          plan: plan ? {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            priceUsdCents: plan.price_usd_cents,
            priceInrCents: plan.price_inr_cents,
            maxLinksPerMonth: plan.max_links_per_month,
            analyticsRetentionDays: plan.analytics_retention_days,
            csvExport: plan.csv_export,
            customQrCodes: plan.custom_qr_codes,
          } : null,
          subscription: subscription ? {
            id: subscription.id,
            planId: subscription.plan_id,
            status: subscription.status,
            currency: subscription.currency,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          } : null,
          usage: {
            linksCreated: usage.links_created,
            linksLimit: plan?.max_links_per_month || 25,
            periodStart: usage.period_start,
            periodEnd: usage.period_end,
          },
        },
      });
    } catch (error) {
      console.error('Get subscription status error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch subscription status' },
      });
    }
  }

  /**
   * POST /api/billing/create-checkout-session - Requires auth
   */
  static async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { currency = 'usd' } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      // Already on pro
      if (user.plan === 'pro') {
        res.status(400).json({
          success: false,
          error: { message: 'You are already on the Pro plan' },
        });
        return;
      }

      // Find or create Stripe customer
      let stripeCustomerId = user.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });
        stripeCustomerId = customer.id;
        await UserModel.updateStripeCustomerId(userId, stripeCustomerId);
      }

      // Get correct price ID
      const priceId = currency === 'inr'
        ? config.stripeProPriceIdInr
        : config.stripeProPriceIdUsd;

      if (!priceId) {
        res.status(500).json({
          success: false,
          error: { message: 'Payment not configured. Please contact support.' },
        });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${config.frontendUrl}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontendUrl}/settings?tab=billing&canceled=true`,
        metadata: { userId, planId: 'pro' },
        subscription_data: {
          metadata: { userId, planId: 'pro' },
        },
        allow_promotion_codes: true,
      });

      res.json({
        success: true,
        data: { sessionId: session.id, url: session.url },
      });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create checkout session' },
      });
    }
  }

  /**
   * POST /api/billing/create-portal-session - Requires auth
   */
  static async createCustomerPortalSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const user = await UserModel.findById(userId);

      if (!user || !user.stripe_customer_id) {
        res.status(400).json({
          success: false,
          error: { message: 'No billing account found' },
        });
        return;
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${config.frontendUrl}/settings?tab=billing`,
      });

      res.json({
        success: true,
        data: { url: portalSession.url },
      });
    } catch (error) {
      console.error('Create portal session error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create portal session' },
      });
    }
  }
}
