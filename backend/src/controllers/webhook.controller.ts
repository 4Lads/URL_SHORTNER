import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import config from '../config/env';
import { UserModel } from '../models/user.model';
import { SubscriptionModel } from '../models/subscription.model';

export class WebhookController {
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await WebhookController.handleCheckoutComplete(session);
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object;
          await WebhookController.handleInvoicePaid(invoice as any);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          await WebhookController.handlePaymentFailed(invoice as any);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await WebhookController.handleSubscriptionUpdated(subscription as any);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await WebhookController.handleSubscriptionDeleted(subscription as any);
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error);
    }

    res.json({ received: true });
  }

  private static async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId || 'pro';

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) return;

    // Get full subscription from Stripe
    const stripeSub: any = await stripe.subscriptions.retrieve(subscriptionId);

    // Create subscription record in database
    await SubscriptionModel.create({
      userId,
      planId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      status: stripeSub.status,
      currency: stripeSub.currency,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    });

    // Upgrade user plan
    await UserModel.updatePlan(userId, planId);

    console.log(`User ${userId} upgraded to ${planId}`);
  }

  private static async handleInvoicePaid(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const subscription = await SubscriptionModel.findByStripeSubscriptionId(subscriptionId);
    if (!subscription) return;

    // Get updated subscription from Stripe
    const stripeSub: any = await stripe.subscriptions.retrieve(subscriptionId);

    await SubscriptionModel.updateByStripeSubscriptionId(subscriptionId, {
      status: 'active',
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    });

    // Ensure user plan is pro (handles reactivation)
    await UserModel.updatePlan(subscription.user_id, subscription.plan_id);
  }

  private static async handlePaymentFailed(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    await SubscriptionModel.updateByStripeSubscriptionId(subscriptionId, {
      status: 'past_due',
    });

    console.log(`Payment failed for subscription ${subscriptionId}`);
  }

  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    await SubscriptionModel.updateByStripeSubscriptionId(subscription.id, {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const dbSub = await SubscriptionModel.findByStripeSubscriptionId(subscription.id);
    if (!dbSub) return;

    await SubscriptionModel.updateByStripeSubscriptionId(subscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    // Downgrade user to free
    await UserModel.updatePlan(dbSub.user_id, 'free');

    console.log(`User ${dbSub.user_id} downgraded to free`);
  }
}
