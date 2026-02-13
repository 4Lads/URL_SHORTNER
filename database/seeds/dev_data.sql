-- Development Seed Data
-- Created: 2026-02-13
-- Description: Sample data for development and testing

-- Note: Password for both users is "password123"
-- Hash generated with bcrypt, 10 rounds

-- Insert test users
INSERT INTO users (id, email, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  ('660e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- Insert test URLs
INSERT INTO urls (id, short_code, original_url, user_id, title, click_count) VALUES
  ('770e8400-e29b-41d4-a716-446655440002', 'test123', 'https://www.example.com', '550e8400-e29b-41d4-a716-446655440000', 'Test Example Link', 45),
  ('880e8400-e29b-41d4-a716-446655440003', 'github1', 'https://github.com', '550e8400-e29b-41d4-a716-446655440000', 'GitHub', 123),
  ('990e8400-e29b-41d4-a716-446655440004', 'google1', 'https://www.google.com', NULL, 'Google Search', 67),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'wiki123', 'https://en.wikipedia.org', '660e8400-e29b-41d4-a716-446655440001', 'Wikipedia', 234)
ON CONFLICT (short_code) DO NOTHING;

-- Insert test clicks
INSERT INTO clicks (url_id, country, city, device_type, browser, referrer) VALUES
  -- Clicks for test123
  ('770e8400-e29b-41d4-a716-446655440002', 'United States', 'New York', 'mobile', 'Chrome', 'https://twitter.com'),
  ('770e8400-e29b-41d4-a716-446655440002', 'India', 'Mumbai', 'desktop', 'Firefox', 'https://facebook.com'),
  ('770e8400-e29b-41d4-a716-446655440002', 'United Kingdom', 'London', 'mobile', 'Safari', 'direct'),

  -- Clicks for github1
  ('880e8400-e29b-41d4-a716-446655440003', 'United States', 'San Francisco', 'desktop', 'Chrome', 'direct'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Canada', 'Toronto', 'mobile', 'Safari', 'https://google.com'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Germany', 'Berlin', 'desktop', 'Firefox', 'https://reddit.com'),

  -- Clicks for google1
  ('990e8400-e29b-41d4-a716-446655440004', 'Japan', 'Tokyo', 'mobile', 'Chrome', 'direct'),
  ('990e8400-e29b-41d4-a716-446655440004', 'Australia', 'Sydney', 'tablet', 'Safari', 'https://twitter.com'),

  -- Clicks for wiki123
  ('aa0e8400-e29b-41d4-a716-446655440005', 'France', 'Paris', 'desktop', 'Chrome', 'https://google.com'),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'Spain', 'Madrid', 'mobile', 'Safari', 'direct');
