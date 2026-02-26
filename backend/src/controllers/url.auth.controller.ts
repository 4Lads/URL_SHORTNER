import { Request, Response } from 'express';
import { UrlModel } from '../models/url.model';
import { UrlService } from '../services/url.service';
import { UsageModel } from '../models/usage.model';
import { z } from 'zod';

// Validation schemas
const createUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  customAlias: z.string().regex(/^[a-zA-Z0-9-_]+$/).optional(),
  title: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateUrlSchema = z.object({
  title: z.string().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export class UrlAuthController {
  /**
   * Get all URLs for authenticated user
   */
  static async getUserUrls(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const total = await UrlModel.countByUserId(userId);

      // Get URLs for this page
      const urls = await UrlModel.findByUserId(userId, limit, offset);

      // Transform to camelCase and add shortUrl
      const baseUrl = process.env.BASE_URL || 'http://localhost:3005';
      const transformedUrls = urls.map((url: any) => ({
        id: url.id,
        shortCode: url.short_code,
        shortUrl: `${baseUrl}/${url.short_code}`,
        originalUrl: url.original_url,
        customAlias: url.custom_alias,
        title: url.title,
        clickCount: url.click_count,
        isActive: url.is_active,
        createdAt: url.created_at,
        updatedAt: url.updated_at,
        expiresAt: url.expires_at,
      }));

      res.json({
        success: true,
        data: {
          urls: transformedUrls,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get user URLs error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch URLs',
        },
      });
    }
  }

  /**
   * Create new URL (authenticated)
   */
  static async createUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      // Validate input
      const validationResult = createUrlSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: validationResult.error.errors,
          },
        });
        return;
      }

      const { url, customAlias, title, expiresAt } = validationResult.data;

      // Use UrlService to create the URL
      const result = await UrlService.shortenUrl({
        url,
        customAlias,
        userId,
        title,
      });

      // Get the full URL record from database to return all fields
      let urlRecord = await UrlModel.findByShortCode(result.shortCode);

      if (!urlRecord) {
        throw new Error('Failed to retrieve created URL');
      }

      // Update expiration if provided
      if (expiresAt) {
        urlRecord = await UrlModel.update(urlRecord.id, { expiresAt });
      }

      // Track usage for quota enforcement
      await UsageModel.incrementLinksCreated(userId);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3005';

      res.status(201).json({
        success: true,
        data: {
          id: urlRecord.id,
          shortCode: urlRecord.short_code,
          shortUrl: `${baseUrl}/${urlRecord.short_code}`,
          originalUrl: urlRecord.original_url,
          title: urlRecord.title,
          clickCount: urlRecord.click_count,
          isActive: urlRecord.is_active,
          createdAt: urlRecord.created_at,
          expiresAt: urlRecord.expires_at,
        },
      });
    } catch (error: any) {
      console.error('Create URL error:', error);

      if (error.message === 'Custom alias already in use') {
        res.status(409).json({
          success: false,
          error: {
            code: 'ALIAS_TAKEN',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create URL',
        },
      });
    }
  }

  /**
   * Get single URL by ID
   */
  static async getUrlById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const url = await UrlModel.findById(id);

      if (!url) {
        res.status(404).json({
          success: false,
          error: {
            message: 'URL not found',
          },
        });
        return;
      }

      // Check ownership
      if (url.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
        return;
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3005';

      res.json({
        success: true,
        data: {
          id: url.id,
          shortCode: url.short_code,
          shortUrl: `${baseUrl}/${url.short_code}`,
          originalUrl: url.original_url,
          title: url.title,
          clickCount: url.click_count,
          isActive: url.is_active,
          createdAt: url.created_at,
          expiresAt: url.expires_at,
        },
      });
    } catch (error) {
      console.error('Get URL by ID error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch URL',
        },
      });
    }
  }

  /**
   * Update URL
   */
  static async updateUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Validate input
      const validationResult = updateUrlSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: validationResult.error.errors,
          },
        });
        return;
      }

      // Check if URL exists and user owns it
      const url = await UrlModel.findById(id);

      if (!url) {
        res.status(404).json({
          success: false,
          error: {
            message: 'URL not found',
          },
        });
        return;
      }

      if (url.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
        return;
      }

      // Update the URL
      const updated = await UrlModel.update(id, validationResult.data);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3005';

      res.json({
        success: true,
        data: {
          id: updated.id,
          shortCode: updated.short_code,
          shortUrl: `${baseUrl}/${updated.short_code}`,
          originalUrl: updated.original_url,
          title: updated.title,
          clickCount: updated.click_count,
          isActive: updated.is_active,
          createdAt: updated.created_at,
          expiresAt: updated.expires_at,
        },
      });
    } catch (error) {
      console.error('Update URL error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update URL',
        },
      });
    }
  }

  /**
   * Delete URL (soft delete)
   */
  static async deleteUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Check if URL exists and user owns it
      const url = await UrlModel.findById(id);

      if (!url) {
        res.status(404).json({
          success: false,
          error: {
            message: 'URL not found',
          },
        });
        return;
      }

      if (url.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
        return;
      }

      // Soft delete (set isActive to false)
      await UrlModel.update(id, { isActive: false });

      res.json({
        success: true,
        message: 'URL deleted successfully',
      });
    } catch (error) {
      console.error('Delete URL error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete URL',
        },
      });
    }
  }
}
