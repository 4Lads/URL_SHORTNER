import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface EnvConfig {
  // Application
  nodeEnv: string;
  port: number;
  baseUrl: string;
  frontendUrl: string;

  // Database
  databaseUrl: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;

  // Redis
  redisUrl: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;

  // Authentication
  jwtSecret: string;
  jwtExpiration: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequestsAnonymous: number;
  rateLimitMaxRequestsAuthenticated: number;

  // Short Code
  shortCodeLength: number;
  shortCodeAlphabet: string;

  // Cache
  cacheTtl: number;

  // Logging
  logLevel: string;

  // CORS
  corsOrigins: string[];
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

export const config: EnvConfig = {
  // Application
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  baseUrl: getEnvVar('BASE_URL', 'http://localhost:3000'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),

  // Database
  databaseUrl: getEnvVar('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/urlshortener'),
  databaseHost: getEnvVar('DATABASE_HOST', 'localhost'),
  databasePort: getEnvNumber('DATABASE_PORT', 5432),
  databaseName: getEnvVar('DATABASE_NAME', 'urlshortener'),
  databaseUser: getEnvVar('DATABASE_USER', 'postgres'),
  databasePassword: getEnvVar('DATABASE_PASSWORD', 'postgres'),

  // Redis
  redisUrl: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  redisHost: getEnvVar('REDIS_HOST', 'localhost'),
  redisPort: getEnvNumber('REDIS_PORT', 6379),
  redisPassword: getEnvVar('REDIS_PASSWORD', ''),

  // Authentication
  jwtSecret: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production'),
  jwtExpiration: getEnvVar('JWT_EXPIRATION', '7d'),

  // Rate Limiting
  rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 3600000), // 1 hour
  rateLimitMaxRequestsAnonymous: getEnvNumber('RATE_LIMIT_MAX_REQUESTS_ANONYMOUS', 10),
  rateLimitMaxRequestsAuthenticated: getEnvNumber('RATE_LIMIT_MAX_REQUESTS_AUTHENTICATED', 100),

  // Short Code
  shortCodeLength: getEnvNumber('SHORT_CODE_LENGTH', 7),
  shortCodeAlphabet: getEnvVar(
    'SHORT_CODE_ALPHABET',
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  ),

  // Cache
  cacheTtl: getEnvNumber('CACHE_TTL', 86400), // 24 hours

  // Logging
  logLevel: getEnvVar('LOG_LEVEL', 'info'),

  // CORS
  corsOrigins: getEnvVar('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(','),
};

// Validate configuration
export const validateConfig = (): void => {
  if (config.nodeEnv === 'production' && config.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    throw new Error('JWT_SECRET must be changed in production!');
  }

  if (config.shortCodeLength < 6 || config.shortCodeLength > 10) {
    throw new Error('SHORT_CODE_LENGTH must be between 6 and 10');
  }
};

export default config;
