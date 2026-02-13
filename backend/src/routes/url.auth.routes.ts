import { Router } from 'express';
import { UrlAuthController } from '../controllers/url.auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all URLs for authenticated user
router.get('/', UrlAuthController.getUserUrls);

// Create new URL (authenticated)
router.post('/', UrlAuthController.createUrl);

// Get single URL by ID
router.get('/:id', UrlAuthController.getUrlById);

// Update URL
router.put('/:id', UrlAuthController.updateUrl);

// Delete URL
router.delete('/:id', UrlAuthController.deleteUrl);

export default router;
