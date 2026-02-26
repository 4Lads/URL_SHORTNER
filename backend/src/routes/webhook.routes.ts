import { Router } from 'express';
import express from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// Stripe webhook needs raw body for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripeWebhook
);

export default router;
