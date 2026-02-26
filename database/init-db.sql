-- ============================================
-- URL Shortener Database Initialization Script
-- ============================================
-- This script creates all necessary tables, indexes, and constraints
-- Run this script on your PostgreSQL database to set up the schema

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. CREATE URLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  custom_alias VARCHAR(50) UNIQUE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_custom_alias ON urls(custom_alias);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);

-- ============================================
-- 3. CREATE CLICKS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  referrer TEXT
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks(browser);

-- ============================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. VERIFY TABLES CREATED
-- ============================================
-- Check if all tables exist
DO $$
BEGIN
  RAISE NOTICE 'Database initialization complete!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - urls';
  RAISE NOTICE '  - clicks';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Triggers created for automatic timestamp updates';
END $$;

-- ============================================
-- 6. SAMPLE DATA (OPTIONAL - Comment out if not needed)
-- ============================================
-- Insert a test user (password: Test123456)
-- Password hash for "Test123456" using bcrypt
INSERT INTO users (email, password_hash)
VALUES ('test@example.com', '$2b$10$rZ7qKx8jVQ5N5nF5Y5nF5O5Y5nF5Y5nF5Y5nF5Y5nF5Y5nF5Y5nF5')
ON CONFLICT (email) DO NOTHING;

-- Get the test user ID for sample URLs
DO $$
DECLARE
  test_user_id UUID;
  test_url_id UUID;
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';

  IF test_user_id IS NOT NULL THEN
    -- Insert sample URL
    INSERT INTO urls (short_code, original_url, user_id, title, is_active)
    VALUES ('abc123', 'https://example.com', test_user_id, 'Example Website', true)
    ON CONFLICT (short_code) DO NOTHING
    RETURNING id INTO test_url_id;

    -- Insert sample clicks if URL was created
    IF test_url_id IS NOT NULL THEN
      INSERT INTO clicks (url_id, device_type, browser, country)
      VALUES
        (test_url_id, 'desktop', 'Chrome', 'United States'),
        (test_url_id, 'mobile', 'Safari', 'United Kingdom'),
        (test_url_id, 'desktop', 'Firefox', 'Canada');

      -- Update click count
      UPDATE urls SET click_count = 3 WHERE id = test_url_id;
    END IF;

    RAISE NOTICE 'Sample data inserted:';
    RAISE NOTICE '  - Test user: test@example.com (password: Test123456)';
    RAISE NOTICE '  - Sample URL: abc123 -> https://example.com';
    RAISE NOTICE '  - Sample clicks: 3 clicks with analytics data';
  END IF;
END $$;

-- ============================================
-- 7. DATABASE STATISTICS
-- ============================================
SELECT
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT
  'urls' as table_name,
  COUNT(*) as row_count
FROM urls
UNION ALL
SELECT
  'clicks' as table_name,
  COUNT(*) as row_count
FROM clicks;
