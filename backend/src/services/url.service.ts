import { UrlModel } from '../models/url.model';
import { generateShortCode, isValidCustomAlias } from '../utils/shortCodeGenerator';
import { isValidUrl, isSafeUrl, normalizeUrl } from '../utils/urlValidator';
import { cacheHelpers } from '../config/redis';
import config from '../config/env';

export class UrlService {
  /**
   * Shorten a URL
   */
  static async shortenUrl(data: {
    url: string;
    customAlias?: string;
    userId?: string;
    title?: string;
  }): Promise<{ shortCode: string; shortUrl: string; originalUrl: string }> {
    // Validate URL
    if (!isValidUrl(data.url)) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }

    // Check for SSRF attacks
    if (!isSafeUrl(data.url)) {
      throw new Error('URL is not allowed (security restriction)');
    }

    // Normalize URL
    const normalizedUrl = normalizeUrl(data.url);

    let shortCode: string;

    // Use custom alias if provided
    if (data.customAlias) {
      if (!isValidCustomAlias(data.customAlias)) {
        throw new Error('Invalid custom alias format');
      }

      // Check if custom alias already exists
      const exists = await UrlModel.existsByShortCode(data.customAlias);
      if (exists) {
        throw new Error('Custom alias already taken');
      }

      shortCode = data.customAlias;
    } else {
      // Generate random short code
      shortCode = await this.generateUniqueShortCode();
    }

    // Create URL entry in database
    const urlRecord = await UrlModel.create({
      shortCode,
      originalUrl: normalizedUrl,
      userId: data.userId,
      customAlias: data.customAlias,
      title: data.title,
    });

    // Cache the short code -> original URL mapping
    await cacheHelpers.set(
      `short_code:${shortCode}`,
      normalizedUrl,
      config.cacheTtl
    );

    // Build short URL
    const shortUrl = `${config.baseUrl}/${shortCode}`;

    return {
      shortCode: urlRecord.short_code,
      shortUrl,
      originalUrl: urlRecord.original_url,
    };
  }

  /**
   * Generate a unique short code (retry if collision)
   */
  private static async generateUniqueShortCode(maxRetries = 5): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const shortCode = generateShortCode();
      const exists = await UrlModel.existsByShortCode(shortCode);

      if (!exists) {
        return shortCode;
      }
    }

    throw new Error('Failed to generate unique short code after multiple attempts');
  }

  /**
   * Get original URL from short code
   */
  static async getOriginalUrl(shortCode: string): Promise<string | null> {
    // Try cache first
    const cached = await cacheHelpers.get(`short_code:${shortCode}`);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const urlRecord = await UrlModel.findByShortCode(shortCode);
    if (!urlRecord) {
      return null;
    }

    // Check if expired
    if (urlRecord.expires_at && new Date(urlRecord.expires_at) < new Date()) {
      return null;
    }

    // Cache for future requests
    await cacheHelpers.set(
      `short_code:${shortCode}`,
      urlRecord.original_url,
      config.cacheTtl
    );

    return urlRecord.original_url;
  }
}
