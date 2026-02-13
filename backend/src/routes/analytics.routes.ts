import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Get analytics for a specific URL
router.get('/:id', AnalyticsController.getUrlAnalytics);

// Export analytics as CSV
router.get('/:id/export', AnalyticsController.exportAnalytics);

export default router;
