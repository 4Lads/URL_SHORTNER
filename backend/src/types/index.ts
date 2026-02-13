// Type definitions for URL Shortener API

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface URL {
  id: string;
  short_code: string;
  original_url: string;
  user_id: string | null;
  custom_alias: string | null;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
  is_active: boolean;
  click_count: number;
}

export interface Click {
  id: string;
  url_id: string;
  clicked_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Request Types
export interface CreateShortUrlRequest {
  url: string;
  customAlias?: string;
  title?: string;
  expiresAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
}

// Express Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
