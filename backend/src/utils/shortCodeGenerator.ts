import config from '../config/env';

/**
 * Base62 Alphabet
 * Using [a-z, A-Z, 0-9] = 62 characters
 */
const ALPHABET = config.shortCodeAlphabet;
const BASE = ALPHABET.length;

/**
 * Generate a random short code using Base62 encoding
 *
 * @param length - Length of the short code (default from config)
 * @returns Random short code string
 *
 * Capacity:
 * - 6 chars: 62^6 = ~56 billion URLs
 * - 7 chars: 62^7 = ~3.5 trillion URLs
 * - 8 chars: 62^8 = ~218 trillion URLs
 */
export const generateShortCode = (length: number = config.shortCodeLength): string => {
  let shortCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE);
    shortCode += ALPHABET[randomIndex];
  }

  return shortCode;
};

/**
 * Generate a short code from a number (counter-based approach)
 * Useful for sequential short codes
 *
 * @param num - Number to encode
 * @returns Base62 encoded string
 */
export const encodeNumber = (num: number): string => {
  if (num === 0) return ALPHABET[0];

  let encoded = '';
  while (num > 0) {
    encoded = ALPHABET[num % BASE] + encoded;
    num = Math.floor(num / BASE);
  }

  return encoded;
};

/**
 * Decode a Base62 string back to a number
 *
 * @param str - Base62 encoded string
 * @returns Decoded number
 */
export const decodeString = (str: string): number => {
  let num = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = ALPHABET.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid character in short code: ${char}`);
    }

    num = num * BASE + index;
  }

  return num;
};

/**
 * Validate if a string is a valid short code
 *
 * @param code - String to validate
 * @returns True if valid, false otherwise
 */
export const isValidShortCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  if (code.length < 3 || code.length > 50) {
    return false;
  }

  // Check if all characters are in the alphabet
  for (const char of code) {
    if (!ALPHABET.includes(char)) {
      return false;
    }
  }

  return true;
};

/**
 * Validate custom alias
 * Custom aliases can contain alphanumeric characters and hyphens
 *
 * @param alias - Custom alias to validate
 * @returns True if valid, false otherwise
 */
export const isValidCustomAlias = (alias: string): boolean => {
  if (!alias || typeof alias !== 'string') {
    return false;
  }

  // Length restrictions
  if (alias.length < 3 || alias.length > 50) {
    return false;
  }

  // Must start and end with alphanumeric
  if (!/^[a-zA-Z0-9]/.test(alias) || !/[a-zA-Z0-9]$/.test(alias)) {
    return false;
  }

  // Can only contain alphanumeric and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
    return false;
  }

  // No consecutive hyphens
  if (/--/.test(alias)) {
    return false;
  }

  return true;
};

/**
 * Sanitize custom alias
 * Remove invalid characters and format properly
 *
 * @param alias - Raw alias input
 * @returns Sanitized alias
 */
export const sanitizeCustomAlias = (alias: string): string => {
  return alias
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
    .replace(/--+/g, '-') // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export default {
  generateShortCode,
  encodeNumber,
  decodeString,
  isValidShortCode,
  isValidCustomAlias,
  sanitizeCustomAlias,
};
