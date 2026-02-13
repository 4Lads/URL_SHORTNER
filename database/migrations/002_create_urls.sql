-- Migration: Create URLs Table
-- Created: 2026-02-13
-- Description: Creates the urls table for storing URL mappings and metadata

-- Up Migration
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  custom_alias VARCHAR(50) UNIQUE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_urls_custom_alias ON urls(custom_alias) WHERE custom_alias IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_urls_click_count ON urls(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_urls_is_active ON urls(is_active) WHERE is_active = true;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_urls_updated_at BEFORE UPDATE ON urls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Down Migration (commented out - uncomment to rollback)
-- DROP TRIGGER IF EXISTS update_urls_updated_at ON urls;
-- DROP TABLE IF EXISTS urls CASCADE;
