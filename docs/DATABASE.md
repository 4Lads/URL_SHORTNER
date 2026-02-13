# Database Documentation

## Overview

This document describes the database schema, relationships, migrations, and best practices for the URL shortener application.

## Database Technology

**Primary Database:** PostgreSQL 15+
**Caching Layer:** Redis 7+

### Why PostgreSQL?

- ACID compliance for data integrity
- Excellent support for relational data
- Rich indexing capabilities
- JSON support for flexible data
- Mature ecosystem and tooling
- Great performance for read-heavy workloads

---

## Schema Overview

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────┐     ┌─────────────┐
│    urls     │────╼│   clicks    │
└─────────────┘  1:N└─────────────┘
```

---

## Table: users

Stores user account information.

### Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key, auto-generated |
| `email` | VARCHAR(255) | No | User email, unique |
| `password_hash` | VARCHAR(255) | No | bcrypt hashed password |
| `created_at` | TIMESTAMP | No | Account creation time |
| `updated_at` | TIMESTAMP | No | Last update time |

### Constraints

- `email` must be unique
- `email` must be valid email format (enforced in application)
- `password_hash` must be bcrypt hash (enforced in application)

### Sample Data

```sql
INSERT INTO users (email, password_hash) VALUES
  ('user@example.com', '$2b$10$KIXXvZ3q3Hn7GZ0qKr2QxO...'),
  ('alice@example.com', '$2b$10$AnotherHashedPassword...');
```

---

## Table: urls

Stores URL mappings and metadata.

### Schema

```sql
CREATE TABLE urls (
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

-- Indexes
CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_created_at ON urls(created_at DESC);
CREATE INDEX idx_urls_custom_alias ON urls(custom_alias) WHERE custom_alias IS NOT NULL;
CREATE INDEX idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_urls_click_count ON urls(click_count DESC);
```

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `short_code` | VARCHAR(10) | No | The short code (unique) |
| `original_url` | TEXT | No | Original long URL |
| `user_id` | UUID | Yes | Owner user ID (null for anonymous) |
| `custom_alias` | VARCHAR(50) | Yes | Custom short code |
| `title` | VARCHAR(255) | Yes | Human-readable title |
| `created_at` | TIMESTAMP | No | Creation time |
| `updated_at` | TIMESTAMP | No | Last update time |
| `expires_at` | TIMESTAMP | Yes | Expiration time (null = never) |
| `is_active` | BOOLEAN | No | Whether URL is active |
| `click_count` | INTEGER | No | Total clicks (denormalized) |

### Constraints

- `short_code` must be unique
- `custom_alias` must be unique (if provided)
- `user_id` foreign key to `users.id` with CASCADE delete
- `is_active` defaults to true
- `click_count` defaults to 0

### Sample Data

```sql
INSERT INTO urls (short_code, original_url, user_id, title) VALUES
  ('aB3xK9', 'https://www.example.com/very/long/url', '550e8400-e29b-41d4-a716-446655440000', 'Example Link'),
  ('custom1', 'https://www.github.com', NULL, 'GitHub');
```

---

## Table: clicks

Stores analytics data for URL clicks.

### Schema

```sql
CREATE TABLE clicks (
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

-- Indexes
CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX idx_clicks_country ON clicks(country);
CREATE INDEX idx_clicks_device_type ON clicks(device_type);

-- Composite index for analytics queries
CREATE INDEX idx_clicks_url_date ON clicks(url_id, clicked_at DESC);
```

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `url_id` | UUID | No | Reference to urls table |
| `clicked_at` | TIMESTAMP | No | When click occurred |
| `ip_address` | VARCHAR(45) | Yes | Hashed IP address (IPv4/IPv6) |
| `user_agent` | TEXT | Yes | Raw user agent string |
| `country` | VARCHAR(100) | Yes | Country from GeoIP |
| `city` | VARCHAR(100) | Yes | City from GeoIP |
| `device_type` | VARCHAR(50) | Yes | mobile/desktop/tablet/bot |
| `browser` | VARCHAR(50) | Yes | Browser name |
| `referrer` | TEXT | Yes | Referrer URL |

### Constraints

- `url_id` foreign key to `urls.id` with CASCADE delete
- `ip_address` should be hashed for privacy (application enforced)

### Partitioning Strategy (Future)

For high-volume data, partition by month:

```sql
-- Example partitioning (PostgreSQL 15+)
CREATE TABLE clicks_2026_02 PARTITION OF clicks
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE clicks_2026_03 PARTITION OF clicks
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

### Sample Data

```sql
INSERT INTO clicks (url_id, ip_address, country, city, device_type, browser) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'hashed_ip_1', 'United States', 'New York', 'mobile', 'Chrome'),
  ('660e8400-e29b-41d4-a716-446655440000', 'hashed_ip_2', 'India', 'Mumbai', 'desktop', 'Safari');
```

---

## Redis Cache Schema

Redis is used for caching frequently accessed URLs.

### Data Structure

**Key Pattern:** `short_code:{code}`
**Value:** Original URL (string)
**TTL:** 24 hours (86400 seconds)

### Example Operations

```redis
# Set cached URL
SET short_code:aB3xK9 "https://www.example.com/long/url" EX 86400

# Get cached URL
GET short_code:aB3xK9

# Check if exists
EXISTS short_code:aB3xK9

# Delete cache
DEL short_code:aB3xK9
```

### Cache Invalidation

Cache must be invalidated when:
1. URL is deleted (`is_active` = false)
2. URL is updated (`original_url` changes - shouldn't happen)
3. URL expires

### Additional Redis Uses

**Rate Limiting:**
```redis
# Key: rate_limit:ip:{ip_address}
INCR rate_limit:ip:192.168.1.1 EX 3600
```

**Session Storage (Future):**
```redis
# Key: session:{session_id}
SET session:abc123 "user_data_json" EX 604800
```

---

## Database Migrations

Migration files are stored in `database/migrations/` and numbered sequentially.

### Migration 001: Create Users Table

**File:** `database/migrations/001_create_users.sql`

```sql
-- Up Migration
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Down Migration (for rollback)
-- DROP TABLE IF EXISTS users CASCADE;
```

### Migration 002: Create URLs Table

**File:** `database/migrations/002_create_urls.sql`

```sql
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

CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_created_at ON urls(created_at DESC);
CREATE INDEX idx_urls_custom_alias ON urls(custom_alias) WHERE custom_alias IS NOT NULL;
CREATE INDEX idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_urls_click_count ON urls(click_count DESC);

-- Down Migration
-- DROP TABLE IF EXISTS urls CASCADE;
```

### Migration 003: Create Clicks Table

**File:** `database/migrations/003_create_clicks.sql`

```sql
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

CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX idx_clicks_country ON clicks(country);
CREATE INDEX idx_clicks_device_type ON clicks(device_type);
CREATE INDEX idx_clicks_url_date ON clicks(url_id, clicked_at DESC);

-- Down Migration
-- DROP TABLE IF EXISTS clicks CASCADE;
```

### Running Migrations

Using `psql`:

```bash
# Run all migrations
psql -U postgres -d urlshortener < database/migrations/001_create_users.sql
psql -U postgres -d urlshortener < database/migrations/002_create_urls.sql
psql -U postgres -d urlshortener < database/migrations/003_create_clicks.sql

# Or run all at once
cat database/migrations/*.sql | psql -U postgres -d urlshortener
```

---

## Seed Data

Seed data for development is stored in `database/seeds/`.

### Seed File: Development Data

**File:** `database/seeds/dev_data.sql`

```sql
-- Insert test users
INSERT INTO users (id, email, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2b$10$KIXXvZ3q3Hn7GZ0qKr2QxO...'),
  ('660e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '$2b$10$AnotherHashedPassword...')
ON CONFLICT (email) DO NOTHING;

-- Insert test URLs
INSERT INTO urls (id, short_code, original_url, user_id, title) VALUES
  ('770e8400-e29b-41d4-a716-446655440002', 'test123', 'https://www.example.com', '550e8400-e29b-41d4-a716-446655440000', 'Test Link'),
  ('880e8400-e29b-41d4-a716-446655440003', 'github1', 'https://github.com', NULL, 'GitHub')
ON CONFLICT (short_code) DO NOTHING;

-- Insert test clicks
INSERT INTO clicks (url_id, country, city, device_type, browser) VALUES
  ('770e8400-e29b-41d4-a716-446655440002', 'United States', 'New York', 'mobile', 'Chrome'),
  ('770e8400-e29b-41d4-a716-446655440002', 'India', 'Mumbai', 'desktop', 'Firefox'),
  ('880e8400-e29b-41d4-a716-446655440003', 'United Kingdom', 'London', 'mobile', 'Safari');
```

---

## Common Queries

### Get URL with Click Count

```sql
SELECT
  u.id,
  u.short_code,
  u.original_url,
  u.title,
  u.created_at,
  COUNT(c.id) as total_clicks
FROM urls u
LEFT JOIN clicks c ON c.url_id = u.id
WHERE u.short_code = 'aB3xK9'
GROUP BY u.id;
```

### Get Top URLs by Clicks

```sql
SELECT
  short_code,
  title,
  click_count
FROM urls
WHERE is_active = true
ORDER BY click_count DESC
LIMIT 10;
```

### Get Clicks by Date Range

```sql
SELECT
  DATE(clicked_at) as date,
  COUNT(*) as clicks
FROM clicks
WHERE url_id = '660e8400-e29b-41d4-a716-446655440000'
  AND clicked_at >= '2026-02-01'
  AND clicked_at < '2026-03-01'
GROUP BY DATE(clicked_at)
ORDER BY date DESC;
```

### Get Clicks by Country

```sql
SELECT
  country,
  COUNT(*) as clicks
FROM clicks
WHERE url_id = '660e8400-e29b-41d4-a716-446655440000'
GROUP BY country
ORDER BY clicks DESC
LIMIT 10;
```

### Get User's URLs with Stats

```sql
SELECT
  u.id,
  u.short_code,
  u.title,
  u.created_at,
  COUNT(c.id) as total_clicks,
  COUNT(DISTINCT c.ip_address) as unique_visitors
FROM urls u
LEFT JOIN clicks c ON c.url_id = u.id
WHERE u.user_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY u.id
ORDER BY u.created_at DESC;
```

### Delete Expired URLs (Cleanup Job)

```sql
UPDATE urls
SET is_active = false
WHERE expires_at IS NOT NULL
  AND expires_at < CURRENT_TIMESTAMP
  AND is_active = true;
```

---

## Database Optimization

### Connection Pooling

Use connection pooling to manage database connections efficiently.

**Example with pg (Node.js):**

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'urlshortener',
  user: 'postgres',
  password: 'password',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Query Performance

1. **Use Indexes:** All foreign keys and frequently queried fields are indexed
2. **Use EXPLAIN:** Analyze slow queries with `EXPLAIN ANALYZE`
3. **Avoid SELECT \*:** Only select needed columns
4. **Use Prepared Statements:** Prevent SQL injection and improve performance

### Vacuum and Analyze

```sql
-- Regular maintenance
VACUUM ANALYZE users;
VACUUM ANALYZE urls;
VACUUM ANALYZE clicks;

-- Auto-vacuum should be enabled (default in PostgreSQL)
```

---

## Backup and Recovery

### Backup Strategy

**Daily Backups:**
```bash
# Full database backup
pg_dump -U postgres urlshortener > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U postgres urlshortener | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Continuous Archiving (Production):**
- Use PostgreSQL WAL archiving
- Point-in-time recovery (PITR)
- Automated backups via managed services (AWS RDS, Supabase, etc.)

### Restore

```bash
# Restore from backup
psql -U postgres -d urlshortener < backup_20260213.sql

# Restore from compressed backup
gunzip -c backup_20260213.sql.gz | psql -U postgres -d urlshortener
```

---

## Database Environment Setup

### Development

```bash
# Create database
createdb -U postgres urlshortener

# Run migrations
psql -U postgres -d urlshortener < database/migrations/001_create_users.sql
psql -U postgres -d urlshortener < database/migrations/002_create_urls.sql
psql -U postgres -d urlshortener < database/migrations/003_create_clicks.sql

# Load seed data
psql -U postgres -d urlshortener < database/seeds/dev_data.sql
```

### Using Docker

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: urlshortener
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

---

## Security Best Practices

1. **Use Prepared Statements:** Always use parameterized queries
2. **Hash IP Addresses:** Before storing in clicks table
3. **Encrypt Sensitive Data:** Use PostgreSQL encryption functions if needed
4. **Limit Permissions:** Database user should have minimal required permissions
5. **Regular Updates:** Keep PostgreSQL updated with security patches
6. **SSL/TLS:** Use encrypted connections in production

### Example: Secure Query

```javascript
// ❌ BAD: SQL Injection vulnerable
const query = `SELECT * FROM urls WHERE short_code = '${shortCode}'`;

// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM urls WHERE short_code = $1';
const result = await pool.query(query, [shortCode]);
```

---

## Monitoring

### Metrics to Track

- Connection pool utilization
- Query execution time
- Table sizes
- Index usage
- Cache hit rate
- Dead tuples (for vacuum)

### Useful Queries

**Table Sizes:**
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

**Index Usage:**
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

**Active Connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```
