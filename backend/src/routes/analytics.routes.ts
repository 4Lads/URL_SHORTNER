import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/feature.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Get analytics for a specific URL
router.get('/:id', AnalyticsController.getUrlAnalytics);

// Export analytics as CSV - requires Pro plan
router.get('/:id/export', requireFeature('csv_export'), AnalyticsController.exportAnalytics);

export default router;
