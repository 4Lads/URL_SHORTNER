# URL Shortener - System Architecture

## Overview
This document describes the system architecture for our URL shortener application, modeled after industry-leading platforms like Bitly and TinyURL, with modern 2026 best practices.

## High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│         Load Balancer/CDN           │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│  Frontend   │ │   Backend   │
│   (React)   │ │  (Node.js)  │
└─────────────┘ └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Redis  │  │PostgreSQL│ │ GeoIP   │
    │ Cache   │  │   DB     │ │ Lookup  │
    └─────────┘  └─────────┘  └─────────┘
```

## Component Details

### 1. Frontend Layer

**Technology:** React + TypeScript + Vite + Tailwind CSS

**Responsibilities:**
- Render minimalist, user-friendly UI
- Handle user input and validation
- Display analytics and dashboards
- Manage client-side routing
- Call backend APIs

**Key Features:**
- Single-page application (SPA)
- Responsive design (mobile-first)
- Copy-to-clipboard functionality
- Real-time form validation
- Chart rendering for analytics

**File Structure:**
```
frontend/src/
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── services/      # API service layer
├── utils/         # Helper functions
└── types/         # TypeScript definitions
```

### 2. Backend Layer

**Technology:** Node.js + Express + TypeScript

**Responsibilities:**
- Process URL shortening requests
- Handle authentication and authorization
- Manage URL redirections
- Track analytics data
- Rate limiting and security

**Core Services:**

#### URL Service
- Generate short codes using Base62 encoding
- Validate and sanitize URLs
- Store URL mappings in database
- Handle custom aliases
- Manage expiration dates

#### Cache Service
- Interface with Redis
- Implement caching strategies
- Handle cache invalidation
- TTL management

#### Analytics Service
- Async click tracking
- User agent parsing
- Geographic lookup
- Data aggregation
- Export functionality

#### QR Code Service
- Generate QR codes
- Support multiple formats (PNG, SVG)
- Custom styling options

**File Structure:**
```
backend/src/
├── config/        # Configuration files
├── controllers/   # Request handlers
├── services/      # Business logic
├── models/        # Data models
├── routes/        # API routes
├── middleware/    # Express middleware
├── utils/         # Utilities
└── types/         # TypeScript types
```

### 3. Database Layer

#### PostgreSQL (Primary Database)

**Purpose:** Store structured, relational data

**Tables:**
- `users` - User accounts
- `urls` - URL mappings and metadata
- `clicks` - Analytics data

**Key Features:**
- ACID compliance
- Foreign key constraints
- Indexes on frequently queried fields
- Connection pooling

#### Redis (Cache Layer)

**Purpose:** High-speed caching for fast redirects

**Data Structure:**
```
Key: short_code:{code}
Value: original_url
TTL: 24 hours (auto-refresh on access)
```

**Additional Uses:**
- Rate limiting counters
- Session storage
- Temporary data storage

**Cache Strategy:**
- Write-through: Update cache when URL is created/updated
- Cache-aside: Check cache first, fall back to DB
- Automatic invalidation on URL deletion

### 4. Supporting Services

#### GeoIP Lookup
- **Library:** MaxMind GeoLite2
- **Purpose:** Convert IP to geographic location
- **Data:** Country, city, coordinates

#### User Agent Parser
- **Purpose:** Extract browser, device, OS info
- **Used For:** Analytics breakdown

## Data Flow

### URL Shortening Flow

```
1. User submits long URL
   ↓
2. Frontend validates URL format
   ↓
3. POST request to /api/shorten
   ↓
4. Backend validates URL
   ↓
5. Generate unique short code (Base62)
   ↓
6. Check database for collisions
   ↓
7. Store mapping in PostgreSQL
   ↓
8. Pre-cache in Redis
   ↓
9. Return short URL to client
   ↓
10. Frontend displays result
```

### URL Redirection Flow

```
1. User clicks short URL
   ↓
2. GET /:shortCode request
   ↓
3. Check Redis cache
   │
   ├─ HIT → Return original URL (fast path)
   │        ↓
   │        Log analytics (async)
   │        ↓
   │        301 Redirect
   │
   └─ MISS → Query PostgreSQL
            ↓
            Found? → Cache in Redis
                     ↓
                     Log analytics (async)
                     ↓
                     301 Redirect

            Not Found? → 404 Page
```

### Analytics Tracking Flow

```
1. Redirect request received
   ↓
2. Extract metadata (IP, user agent, referrer)
   ↓
3. Async operation (non-blocking):
   ├─ Parse user agent → browser, device, OS
   ├─ GeoIP lookup → country, city
   └─ Batch insert into clicks table
```

## Scalability Considerations

### Horizontal Scaling

**Backend:**
- Stateless application servers
- Can add more instances behind load balancer
- Shared Redis cache across instances
- Database connection pooling

**Database:**
- Read replicas for analytics queries
- Partitioning clicks table by date
- Indexes on frequently queried fields

**Cache:**
- Redis Cluster for distributed caching
- Consistent hashing for key distribution

### Performance Optimizations

1. **Caching Strategy:**
   - 80/20 rule: Top 20% of URLs get 80% of traffic
   - Cache hot URLs indefinitely
   - Lazy cache population

2. **Database Optimization:**
   - Prepared statements
   - Batch inserts for analytics
   - Index optimization

3. **API Performance:**
   - Response compression (gzip)
   - Connection pooling
   - Async/await for I/O operations

### Estimated Capacity

**Short Code Space:**
- Base62 encoding: [a-z, A-Z, 0-9]
- 7 characters: 62^7 = ~3.5 trillion unique URLs
- 8 characters: 62^8 = ~218 trillion unique URLs

**Request Handling:**
- Target: 10,000 requests/second
- With caching: 95% cache hit rate
- Database queries: ~500 req/sec

## Security Architecture

### Authentication Flow

```
1. User registers/logs in
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT token
   ↓
4. Return token to client
   ↓
5. Client stores in httpOnly cookie or localStorage
   ↓
6. Subsequent requests include token in Authorization header
   ↓
7. Middleware validates token
   ↓
8. Allow/deny request
```

### Security Layers

1. **Input Validation:**
   - URL format validation
   - Custom alias sanitization
   - XSS prevention
   - SQL injection prevention (parameterized queries)

2. **Rate Limiting:**
   - Per-IP rate limiting (Redis-based)
   - Per-user rate limiting
   - Exponential backoff for repeated violations

3. **Authentication:**
   - bcrypt password hashing (10 rounds)
   - JWT with expiration
   - Refresh token rotation

4. **CORS:**
   - Whitelist allowed origins
   - Proper preflight handling

5. **HTTPS:**
   - Force HTTPS in production
   - Secure cookie flags

## Monitoring & Observability

### Logging Strategy
- **Application Logs:** Winston or Pino
- **Access Logs:** Morgan middleware
- **Error Tracking:** Sentry or similar
- **Log Levels:** Error, Warn, Info, Debug

### Metrics to Track
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Cache hit rate
- Database query time
- Error rate
- Active users

### Health Checks
- `/health` endpoint
- Database connectivity check
- Redis connectivity check
- Memory usage
- CPU usage

## Deployment Architecture

### Development Environment
```
Docker Compose:
├── frontend (Vite dev server)
├── backend (ts-node-dev)
├── postgresql
├── redis
└── nginx (reverse proxy)
```

### Production Environment
```
Frontend: Vercel/Netlify (CDN + SSG)
Backend: Railway/Render (container)
Database: Supabase/Neon (managed PostgreSQL)
Cache: Upstash (managed Redis)
CDN: Cloudflare
```

## Technology Choices & Rationale

| Component | Technology | Why? |
|-----------|-----------|------|
| Frontend Framework | React | Industry standard, huge ecosystem, excellent tooling |
| Build Tool | Vite | Fast, modern, better DX than CRA |
| Styling | Tailwind CSS | Utility-first, perfect for minimalist design |
| Backend Runtime | Node.js | JavaScript everywhere, async I/O, large ecosystem |
| Backend Framework | Express | Mature, flexible, extensive middleware |
| Language | TypeScript | Type safety, better DX, fewer runtime errors |
| Primary DB | PostgreSQL | ACID, relational data, excellent performance |
| Cache | Redis | In-memory, fast, built-in TTL, pub/sub |
| Containerization | Docker | Consistency across environments, easy deployment |

## API Architecture

**Style:** RESTful API

**Conventions:**
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response bodies
- Consistent error format
- Versioning strategy (future: /api/v1)

**Authentication:**
- JWT tokens in Authorization header
- Bearer token scheme

**Rate Limiting:**
- Return 429 Too Many Requests
- Include Retry-After header

## Future Enhancements

### Phase 2 Additions
- Microservices architecture
- Event-driven analytics (Kafka/RabbitMQ)
- GraphQL API option
- Mobile apps (React Native)

### Scalability Upgrades
- CDN integration for static assets
- Multi-region deployment
- Database sharding
- Read replicas

### Advanced Features
- A/B testing for links
- Link preview generation
- Browser extension
- Webhooks for events
