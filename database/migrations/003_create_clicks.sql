-- Migration: Create Clicks Table
-- Created: 2026-02-13
-- Description: Creates the clicks table for storing analytics data

-- Up Migration
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  referrer TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks(browser);

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_url_date ON clicks(url_id, clicked_at DESC);

-- Down Migration (commented out - uncomment to rollback)
-- DROP TABLE IF EXISTS clicks CASCADE;
