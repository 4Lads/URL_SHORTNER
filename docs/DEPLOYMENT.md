# URL Shortener - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Docker Deployment](#docker-deployment)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Software
- **Git**: Version 2.30 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **Node.js**: Version 18 or higher (for local development without Docker)
- **PostgreSQL**: Version 14 or higher (for local development without Docker)
- **Redis**: Version 7 or higher (for local development without Docker)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 2GB free
- **OS**: Linux, macOS, or Windows 10/11 with WSL2

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ronit-Joseph/URL_SHORTNER.git
cd URL_SHORTNER
```

### 2. Verify Project Structure

```bash
ls -la
# Should see:
# - backend/
# - frontend/
# - database/
# - docker/
# - docs/
```

### 3. Create Environment Files

#### Backend Environment (.env)

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3005

# Database Configuration
DATABASE_URL=postgresql://urlshortener:SecurePassword123@postgres:5432/urlshortener

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Environment (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3005/api
```

### 4. Important: Update Docker Compose Environment

Edit `docker/docker-compose.yml` and ensure PostgreSQL password matches:

```yaml
environment:
  POSTGRES_PASSWORD: SecurePassword123  # Must match DATABASE_URL
```

---

## Environment Configuration

### Environment Variables Explained

#### Backend Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production`, `development` | ✅ |
| `PORT` | Internal server port | `3000` | ✅ |
| `BASE_URL` | Public URL for short links | `https://yourdomain.com` | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | ✅ |
| `REDIS_HOST` | Redis hostname | `redis` (Docker), `localhost` (local) | ✅ |
| `REDIS_PORT` | Redis port | `6379` | ✅ |
| `REDIS_PASSWORD` | Redis password | Leave empty for local | ❌ |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string | ✅ |
| `JWT_EXPIRATION` | Token expiration time | `7d`, `24h`, `30d` | ✅ |
| `CORS_ORIGIN` | Allowed frontend origin | `https://app.yourdomain.com` | ✅ |

#### Frontend Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `https://api.yourdomain.com/api` | ✅ |

### Security Considerations

⚠️ **NEVER commit `.env` files to Git**

1. Change default passwords before production
2. Generate a strong JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Use environment-specific `.env` files:
   - `.env.development`
   - `.env.production`
   - `.env.staging`

---

## Database Setup

### Automatic Setup (Recommended)

The database migrations run automatically when the Docker containers start.

### Manual Setup (Optional)

If you need to run migrations manually:

```bash
# Access PostgreSQL container
docker exec -it urlshortener_postgres psql -U urlshortener -d urlshortener

# Run migrations in order
\i /docker-entrypoint-initdb.d/001_create_users.sql
\i /docker-entrypoint-initdb.d/002_create_urls.sql
\i /docker-entrypoint-initdb.d/003_create_clicks.sql
```

### Database Schema Overview

**Tables:**
1. **users** - User accounts with authentication
2. **urls** - Shortened URLs with metadata
3. **clicks** - Click analytics data

**Indexes:**
- `urls(short_code)` - Fast redirect lookup
- `urls(user_id)` - User URL listing
- `clicks(url_id)` - Analytics queries
- `clicks(clicked_at)` - Time-based filtering

### Seed Data (Development Only)

To populate development data:

```bash
docker exec -it urlshortener_postgres psql -U urlshortener -d urlshortener -f /docker-entrypoint-initdb.d/dev_data.sql
```

---

## Docker Deployment

### Quick Start (Development)

```bash
# Navigate to docker directory
cd docker

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Service URLs (Development)

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3005
- **Backend Health**: http://localhost:3005/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6380

### Build and Restart Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (CAREFUL: Deletes database data)
docker-compose down -v
```

### Docker Compose Services

```yaml
services:
  postgres:    # PostgreSQL database
  redis:       # Redis cache
  backend:     # Node.js API server
  frontend:    # Vite development server
```

### Container Health Checks

```bash
# Check if all containers are healthy
docker-compose ps

# Expected output:
# NAME                    STATUS
# urlshortener_backend    Up (healthy)
# urlshortener_frontend   Up
# urlshortener_postgres   Up (healthy)
# urlshortener_redis      Up (healthy)
```

---

## Production Deployment

### Option 1: Docker Compose (VPS/Server)

#### 1. Prepare Production Environment

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone Repository on Server

```bash
git clone https://github.com/Ronit-Joseph/URL_SHORTNER.git
cd URL_SHORTNER
```

#### 3. Configure Production Environment

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

DATABASE_URL=postgresql://urlshortener:STRONG_PASSWORD_HERE@postgres:5432/urlshortener

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

JWT_SECRET=GENERATE_STRONG_SECRET_HERE
JWT_EXPIRATION=7d

CORS_ORIGIN=https://yourdomain.com
```

Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

#### 4. Update Docker Compose for Production

Edit `docker/docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
    ports:
      - "3005:3000"  # Change to internal port or use reverse proxy
    restart: unless-stopped

  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
      target: production  # Use production build
    ports:
      - "80:80"  # Serve on port 80
    restart: unless-stopped
```

#### 5. Deploy

```bash
cd docker
docker-compose -f docker-compose.yml --env-file ../backend/.env.production up -d --build
```

#### 6. Setup Nginx Reverse Proxy (Recommended)

Install Nginx:

```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/urlshortener`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }

    # Short URL redirects
    location ~ ^/[a-zA-Z0-9_-]+$ {
        proxy_pass http://localhost:3005;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/urlshortener /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Cloud Platform Deployment

#### Vercel (Frontend) + Railway (Backend + Database)

**Frontend on Vercel:**

1. Fork repository to your GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project
4. Set build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`
5. Add environment variable:
   - `VITE_API_URL`: Your Railway backend URL

**Backend on Railway:**

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository
4. Add PostgreSQL service
5. Add Redis service
6. Configure backend service:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
7. Add environment variables (copy from `.env`)
8. Deploy

#### AWS (EC2 + RDS + ElastiCache)

1. **Launch EC2 instance** (Ubuntu 22.04, t2.medium or larger)
2. **Create RDS PostgreSQL** database
3. **Create ElastiCache Redis** cluster
4. **Configure Security Groups** (allow ports 80, 443, 5432, 6379)
5. **SSH into EC2** and follow Docker Compose deployment steps
6. **Update environment variables** with RDS and ElastiCache endpoints

#### DigitalOcean App Platform

1. Create new app from GitHub repository
2. Configure components:
   - Frontend (Static Site)
   - Backend (Web Service)
   - PostgreSQL (Database)
   - Redis (Database)
3. Set environment variables
4. Deploy

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Port 5432 is already allocated`

**Solution:**
```bash
# Find and stop conflicting process
sudo lsof -i :5432
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different external port
```

#### 2. Database Connection Failed

**Error:** `Error connecting to database`

**Solution:**
```bash
# Check database is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify DATABASE_URL matches docker-compose.yml password
# backend/.env: postgresql://urlshortener:PASSWORD@postgres:5432/urlshortener
# docker-compose.yml: POSTGRES_PASSWORD: PASSWORD  (must match)
```

#### 3. Frontend Can't Connect to Backend

**Error:** `Network Error` or `CORS Error`

**Solution:**
```bash
# Check backend is running
docker-compose logs backend

# Verify VITE_API_URL in frontend/.env
VITE_API_URL=http://localhost:3005/api

# Verify CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173

# Restart frontend
docker-compose restart frontend
```

#### 4. Redis Connection Timeout

**Error:** `Redis connection timeout`

**Solution:**
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker exec -it urlshortener_redis redis-cli ping
# Should return: PONG

# Verify REDIS_HOST in backend/.env
REDIS_HOST=redis  # For Docker
# or
REDIS_HOST=localhost  # For local Redis
```

#### 5. Build Errors

**Error:** `npm install failed` or `TypeScript compilation error`

**Solution:**
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache

# Check Node version in Dockerfile
# frontend/Dockerfile: FROM node:20-alpine
# backend/Dockerfile: FROM node:18-alpine
```

### Health Check Commands

```bash
# Check all services
docker-compose ps

# Test backend health
curl http://localhost:3005/health

# Test database connection
docker exec -it urlshortener_postgres psql -U urlshortener -d urlshortener -c "SELECT 1;"

# Test Redis
docker exec -it urlshortener_redis redis-cli ping

# Test frontend
curl http://localhost:5173
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# View last 100 lines
docker-compose logs --tail=100 backend

# Export logs to file
docker-compose logs > deployment-logs.txt
```

---

## Post-Deployment Checklist

### Before Going Live

- [ ] **Environment Variables Set**
  - [ ] `JWT_SECRET` changed from default
  - [ ] `DATABASE_URL` uses strong password
  - [ ] `REDIS_PASSWORD` set (if using managed Redis)
  - [ ] `BASE_URL` points to production domain
  - [ ] `CORS_ORIGIN` matches frontend domain

- [ ] **Security**
  - [ ] SSL certificates installed (HTTPS enabled)
  - [ ] Firewall configured (UFW or Security Groups)
  - [ ] Database not publicly accessible
  - [ ] Redis password protected
  - [ ] Rate limiting enabled

- [ ] **Performance**
  - [ ] Redis caching working (test redirects)
  - [ ] Database indexes created
  - [ ] Frontend build optimized (production mode)
  - [ ] CDN configured for static assets (optional)

- [ ] **Monitoring**
  - [ ] Error tracking setup (Sentry, LogRocket)
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Database backups configured
  - [ ] Log aggregation (CloudWatch, DataDog)

- [ ] **Testing**
  - [ ] Create test account
  - [ ] Shorten test URL
  - [ ] Verify redirect works
  - [ ] Check analytics tracking
  - [ ] Export CSV
  - [ ] Test on mobile devices
  - [ ] Load testing (optional)

### First User Setup

```bash
# Create first user via API
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "StrongPassword123!"
  }'

# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "StrongPassword123!"
  }'
```

### Backup Strategy

**Database Backup:**

```bash
# Manual backup
docker exec urlshortener_postgres pg_dump -U urlshortener urlshortener > backup-$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * docker exec urlshortener_postgres pg_dump -U urlshortener urlshortener > /backups/db-$(date +\%Y\%m\%d).sql
```

**Restore from Backup:**

```bash
docker exec -i urlshortener_postgres psql -U urlshortener urlshortener < backup-20260214.sql
```

### Scaling Considerations

**Vertical Scaling (Single Server):**
- Increase RAM/CPU on current server
- Upgrade Docker resource limits
- Optimize database queries

**Horizontal Scaling (Multiple Servers):**
- Use managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
- Use managed Redis (AWS ElastiCache, Redis Cloud)
- Deploy multiple backend instances behind load balancer
- Use CDN for frontend (Cloudflare, AWS CloudFront)

---

## Support and Resources

**Documentation:**
- [DAILY_OPS.md](./DAILY_OPS.md) - Complete development log
- [API.md](./API.md) - API endpoint reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATABASE.md](./DATABASE.md) - Database schema

**Community:**
- GitHub Issues: https://github.com/Ronit-Joseph/URL_SHORTNER/issues
- Report bugs and request features

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL 14, Redis 7
- Deployment: Docker, Docker Compose

---

## Quick Reference Commands

```bash
# Start development environment
cd docker && docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Rebuild and restart
docker-compose build backend && docker-compose up -d backend

# Stop all services
docker-compose down

# Database backup
docker exec urlshortener_postgres pg_dump -U urlshortener urlshortener > backup.sql

# Access database
docker exec -it urlshortener_postgres psql -U urlshortener -d urlshortener

# Check service health
curl http://localhost:3005/health

# Push code to GitHub
git add . && git commit -m "message" && git push origin master
```

---

**Deployment Version:** 1.0.0
**Last Updated:** 2026-02-14
**Tested Environments:** Docker 20.10+, Ubuntu 22.04, macOS 13+, Windows 11 WSL2
