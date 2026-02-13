# API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://api.yourdomain.com
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

### Token Expiration
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days (future implementation)

---

## Public Endpoints

### 1. Shorten URL (Anonymous)

Create a shortened URL without authentication.

**Endpoint:** `POST /api/shorten`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://www.example.com/very/long/url/that/needs/shortening"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "shortCode": "aB3xK9",
    "shortUrl": "http://localhost:3000/aB3xK9",
    "originalUrl": "https://www.example.com/very/long/url/that/needs/shortening",
    "createdAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL format. URL must start with http:// or https://"
  }
}
```

**Rate Limit:** 10 requests per hour per IP

---

### 2. Redirect to Original URL

Redirect from short code to original URL.

**Endpoint:** `GET /:shortCode`

**Parameters:**
- `shortCode` (path) - The short code to redirect

**Response:** `301 Moved Permanently`
```http
Location: https://www.example.com/original/url
```

**Error Response:** `404 Not Found`
```html
<!-- User-friendly 404 page -->
<html>
  <body>
    <h1>Link Not Found</h1>
    <p>This short link doesn't exist or has expired.</p>
  </body>
</html>
```

**Performance:**
- Cached URLs: <50ms response time
- Uncached URLs: <100ms response time

---

### 3. Get URL Info (Public)

Get public information about a short URL.

**Endpoint:** `GET /api/url/:shortCode/info`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "shortCode": "aB3xK9",
    "title": "Example Website",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "totalClicks": 1523,
    "isActive": true
  }
}
```

---

## Authentication Endpoints

### 4. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 characters, must contain letter and number

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "createdAt": "2026-02-13T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

---

### 5. Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### 6. Get Current User

Get authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "totalUrls": 42,
    "totalClicks": 5234
  }
}
```

---

## Protected URL Endpoints

All endpoints below require authentication.

### 7. Create Short URL (Authenticated)

Create a short URL with optional custom alias.

**Endpoint:** `POST /api/urls`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://www.example.com/long/url",
  "customAlias": "my-custom-link",
  "title": "My Example Link",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

**Fields:**
- `url` (required) - The long URL to shorten
- `customAlias` (optional) - Custom short code (alphanumeric + hyphens)
- `title` (optional) - Human-readable title
- `expiresAt` (optional) - Expiration date/time

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "shortCode": "my-custom-link",
    "shortUrl": "http://localhost:3000/my-custom-link",
    "originalUrl": "https://www.example.com/long/url",
    "title": "My Example Link",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "isActive": true,
    "clickCount": 0
  }
}
```

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "error": {
    "code": "ALIAS_TAKEN",
    "message": "This custom alias is already in use"
  }
}
```

**Rate Limit:** 100 requests per hour

---

### 8. List User's URLs

Get all URLs created by the authenticated user.

**Endpoint:** `GET /api/urls`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)
- `sortBy` (optional) - Sort field: `createdAt`, `clickCount`, `title`
- `order` (optional) - Sort order: `asc`, `desc` (default: `desc`)

**Example:** `GET /api/urls?page=1&limit=20&sortBy=clickCount&order=desc`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "urls": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "shortCode": "aB3xK9",
        "shortUrl": "http://localhost:3000/aB3xK9",
        "originalUrl": "https://www.example.com/page",
        "title": "Example Page",
        "clickCount": 156,
        "isActive": true,
        "createdAt": "2026-02-13T10:30:00.000Z",
        "expiresAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

---

### 9. Get Single URL

Get details for a specific URL owned by the user.

**Endpoint:** `GET /api/urls/:id`

**Parameters:**
- `id` (path) - UUID of the URL

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "shortCode": "aB3xK9",
    "shortUrl": "http://localhost:3000/aB3xK9",
    "originalUrl": "https://www.example.com/page",
    "title": "Example Page",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "clickCount": 156,
    "isActive": true,
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z",
    "expiresAt": null
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "URL_NOT_FOUND",
    "message": "URL not found or you don't have permission to access it"
  }
}
```

---

### 10. Update URL

Update URL metadata (title, expiration, active status).

**Endpoint:** `PUT /api/urls/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "isActive": false
}
```

**Note:** Cannot update `url` or `shortCode` after creation

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "shortCode": "aB3xK9",
    "title": "Updated Title",
    "isActive": false,
    "expiresAt": "2027-01-01T00:00:00.000Z",
    "updatedAt": "2026-02-13T11:00:00.000Z"
  }
}
```

---

### 11. Delete URL

Soft delete a URL (sets isActive to false).

**Endpoint:** `DELETE /api/urls/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "URL deleted successfully"
}
```

---

## Analytics Endpoints

### 12. Get URL Analytics

Get detailed analytics for a specific URL.

**Endpoint:** `GET /api/analytics/:id`

**Query Parameters:**
- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)
- `granularity` (optional) - `hour`, `day`, `week`, `month` (default: `day`)

**Example:** `GET /api/analytics/660e8400-e29b-41d4-a716-446655440000?startDate=2026-02-01&endDate=2026-02-13&granularity=day`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "urlId": "660e8400-e29b-41d4-a716-446655440000",
    "totalClicks": 1523,
    "uniqueClicks": 892,
    "clicksByDate": [
      { "date": "2026-02-13", "clicks": 45 },
      { "date": "2026-02-12", "clicks": 67 }
    ],
    "clicksByCountry": [
      { "country": "United States", "clicks": 654 },
      { "country": "India", "clicks": 423 },
      { "country": "United Kingdom", "clicks": 234 }
    ],
    "clicksByDevice": [
      { "device": "mobile", "clicks": 823 },
      { "device": "desktop", "clicks": 567 },
      { "device": "tablet", "clicks": 133 }
    ],
    "clicksByBrowser": [
      { "browser": "Chrome", "clicks": 912 },
      { "browser": "Safari", "clicks": 345 },
      { "browser": "Firefox", "clicks": 178 }
    ],
    "topReferrers": [
      { "referrer": "twitter.com", "clicks": 234 },
      { "referrer": "facebook.com", "clicks": 156 },
      { "referrer": "direct", "clicks": 890 }
    ]
  }
}
```

---

### 13. Export Analytics

Export analytics data as CSV.

**Endpoint:** `GET /api/analytics/:id/export`

**Query Parameters:**
- `startDate` (optional) - Start date
- `endDate` (optional) - End date
- `format` (optional) - `csv` or `json` (default: `csv`)

**Response:** `200 OK`
```csv
timestamp,country,city,device,browser,referrer
2026-02-13T10:30:00.000Z,United States,New York,mobile,Chrome,twitter.com
2026-02-13T10:31:00.000Z,India,Mumbai,desktop,Safari,direct
```

**Headers:**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="analytics-aB3xK9.csv"
```

---

## QR Code Endpoints

### 14. Generate QR Code

Generate a QR code for a short URL.

**Endpoint:** `POST /api/qr/:shortCode`

**Query Parameters:**
- `format` (optional) - `png` or `svg` (default: `png`)
- `size` (optional) - Size in pixels (default: 300, max: 1000)
- `color` (optional) - Hex color (default: `#000000`)

**Example:** `POST /api/qr/aB3xK9?format=png&size=400`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "format": "png",
    "size": 400
  }
}
```

**For SVG format:**
```json
{
  "success": true,
  "data": {
    "qrCodeSvg": "<svg xmlns=\"http://www.w3.org/2000/svg\"...",
    "format": "svg"
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | URL format is invalid |
| `INVALID_REQUEST` | 400 | Request body validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `ALIAS_TAKEN` | 409 | Custom alias already in use |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Rate limits are enforced per IP address or per authenticated user.

### Limits

| User Type | Endpoint | Limit |
|-----------|----------|-------|
| Anonymous | `POST /api/shorten` | 10/hour |
| Authenticated | `POST /api/urls` | 100/hour |
| Authenticated | All other endpoints | 1000/hour |

### Rate Limit Headers

Response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642089600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 minutes.",
    "retryAfter": 2700
  }
}
```

---

## Pagination

List endpoints support pagination with these query parameters:

- `page` - Page number (1-indexed)
- `limit` - Items per page (max 100)

### Pagination Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Versioning

Currently at version 1 (implicit). Future versions will use URL versioning:

```
/api/v1/urls
/api/v2/urls
```

---

## CORS

CORS is configured to allow requests from:

**Development:** `http://localhost:5173` (Vite dev server)
**Production:** Your production frontend domain

Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
Allowed headers: `Content-Type, Authorization`

---

## Webhooks (Future)

Future feature: Webhook notifications for events.

### Events
- `url.created` - New URL created
- `url.clicked` - URL was accessed
- `url.expired` - URL reached expiration
- `url.milestone` - URL reached click milestone (100, 1000, 10000)

---

## SDK Examples (Future)

### JavaScript/Node.js

```javascript
import URLShortener from '@urlshortener/sdk';

const client = new URLShortener({
  apiKey: 'your-api-key'
});

const result = await client.shorten({
  url: 'https://example.com/long-url'
});

console.log(result.shortUrl);
```

### Python

```python
from urlshortener import Client

client = Client(api_key='your-api-key')
result = client.shorten('https://example.com/long-url')
print(result.short_url)
```
