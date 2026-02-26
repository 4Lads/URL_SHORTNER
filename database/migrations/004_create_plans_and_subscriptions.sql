-- ============================================
-- Migration 004: Plans, Subscriptions & Usage Tracking
-- ============================================

-- 1. Extend users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- 2. Plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_usd_cents INTEGER NOT NULL DEFAULT 0,
  price_inr_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id_usd VARCHAR(255),
  stripe_price_id_inr VARCHAR(255),
  max_links_per_month INTEGER NOT NULL DEFAULT 25,
  analytics_retention_days INTEGER NOT NULL DEFAULT 7,
  custom_domains BOOLEAN DEFAULT false,
  password_protected_links BOOLEAN DEFAULT false,
  custom_qr_codes BOOLEAN DEFAULT false,
  csv_export BOOLEAN DEFAULT false,
  api_rate_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed plans
INSERT INTO plans (id, name, description, price_usd_cents, price_inr_cents,
  max_links_per_month, analytics_retention_days, custom_domains,
  password_protected_links, custom_qr_codes, csv_export, api_rate_limit)
VALUES
  ('free', 'Free', 'Get started with basic link shortening', 0, 0,
    25, 7, false, false, false, false, 10),
  ('pro', 'Pro', 'Advanced features for professionals', 1900, 149900,
    1000, 90, true, true, true, true, 100)
ON CONFLICT (id) DO NOTHING;

-- 3. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) NOT NULL REFERENCES plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  links_created INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
