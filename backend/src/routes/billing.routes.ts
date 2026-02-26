import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/plans', BillingController.getPlans);

// Protected
router.get('/subscription', authMiddleware, BillingController.getSubscriptionStatus);
router.post('/create-checkout-session', authMiddleware, BillingController.createCheckoutSession);
router.post('/create-portal-session', authMiddleware, BillingController.createCustomerPortalSession);

export default router;
