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

// Billing Types
export interface PlanType {
  id: string;
  name: string;
  description: string | null;
  price_usd_cents: number;
  price_inr_cents: number;
  stripe_price_id_usd: string | null;
  stripe_price_id_inr: string | null;
  max_links_per_month: number;
  analytics_retention_days: number;
  custom_domains: boolean;
  password_protected_links: boolean;
  custom_qr_codes: boolean;
  csv_export: boolean;
  api_rate_limit: number;
  created_at: Date;
}

export interface SubscriptionType {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  currency: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UsageTrackingType {
  id: string;
  user_id: string;
  period_start: Date;
  period_end: Date;
  links_created: number;
  created_at: Date;
  updated_at: Date;
}

// Express Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userPlan?: PlanType;
    }
  }
}
