import { Request, Response } from 'express';
import { UrlService } from '../services/url.service';
import { UrlModel } from '../models/url.model';
import { ClickModel } from '../models/click.model';

export class UrlController {
  /**
   * POST /api/shorten
   * Shorten a URL
   */
  static async shortenUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url, customAlias, title } = req.body;

      // Validate required fields
      if (!url) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_URL',
            message: 'URL is required',
          },
        });
        return;
      }

      // Get user ID if authenticated (future feature)
      const userId = req.user?.userId;

      // Shorten URL
      const result = await UrlService.shortenUrl({
        url,
        customAlias,
        userId,
        title,
      });

      res.status(201).json({
        success: true,
        data: {
          shortCode: result.shortCode,
          shortUrl: result.shortUrl,
          originalUrl: result.originalUrl,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error shortening URL:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to shorten URL';

      // Handle specific errors
      if (errorMessage.includes('Invalid URL')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: errorMessage,
          },
        });
        return;
      }

      if (errorMessage.includes('already taken')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'ALIAS_TAKEN',
            message: errorMessage,
          },
        });
        return;
      }

      if (errorMessage.includes('not allowed')) {
        res.status(403).json({
          success: false,
          error: {
            code: 'URL_NOT_ALLOWED',
            message: errorMessage,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }

  /**
   * GET /:shortCode
   * Redirect to original URL
   */
  static async redirectToOriginal(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;

      // Get original URL
      const originalUrl = await UrlService.getOriginalUrl(shortCode);

      if (!originalUrl) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Short URL not found or has expired',
          },
        });
        return;
      }

      // Track click analytics (async, non-blocking)
      const urlRecord = await UrlModel.findByShortCode(shortCode);
      if (urlRecord) {
        // Increment click count in urls table
        UrlModel.incrementClickCount(urlRecord.id).catch(err => {
          console.error('Error incrementing click count:', err);
        });

        // Extract request metadata for analytics
        const userAgent = req.headers['user-agent'] || null;
        const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                          req.socket.remoteAddress ||
                          null;
        const referrer = req.headers['referer'] || req.headers['referrer'] || null;

        // Parse device type from user agent
        let deviceType = 'unknown';
        if (userAgent) {
          if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
            deviceType = /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile';
          } else {
            deviceType = 'desktop';
          }
        }

        // Parse browser from user agent
        let browser = 'Unknown';
        if (userAgent) {
          if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
          else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
          else if (userAgent.includes('Firefox')) browser = 'Firefox';
          else if (userAgent.includes('Edg')) browser = 'Edge';
          else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
        }

        // Create click record for analytics
        ClickModel.create({
          urlId: urlRecord.id,
          ipAddress: ipAddress as string,
          userAgent: userAgent as string,
          deviceType,
          browser,
          referrer: referrer as string,
        }).catch(err => {
          console.error('Error creating click record:', err);
        });
      }

      // Redirect to original URL
      res.redirect(302, originalUrl);
    } catch (error) {
      console.error('Error redirecting:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }
}
