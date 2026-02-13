import { URL } from 'url';

/**
 * Validate if a string is a valid URL
 *
 * @param url - URL string to validate
 * @returns True if valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Basic length check
  if (url.length > 2048) {
    return false; // URLs longer than 2048 chars are generally not supported
  }

  try {
    const parsed = new URL(url);

    // Must be http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Must have a hostname
    if (!parsed.hostname) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Normalize URL (add protocol if missing, remove trailing slash, etc.)
 *
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export const normalizeUrl = (url: string): string => {
  let normalized = url.trim();

  // Add https:// if no protocol specified
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  try {
    const parsed = new URL(normalized);

    // Remove trailing slash from pathname
    if (parsed.pathname.endsWith('/') && parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch (error) {
    // If normalization fails, return original
    return url;
  }
};

/**
 * Check if URL is safe (not pointing to localhost, private IPs, etc.)
 * Prevents SSRF attacks
 *
 * @param url - URL to check
 * @returns True if safe, false otherwise
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Block private IP ranges (simplified check)
    if (
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extract domain from URL
 *
 * @param url - URL string
 * @returns Domain name or null
 */
export const extractDomain = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return null;
  }
};

export default {
  isValidUrl,
  normalizeUrl,
  isSafeUrl,
  extractDomain,
};
