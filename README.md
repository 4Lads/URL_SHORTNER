# URL Shortener

A modern, scalable URL shortener application built with industry best practices. Shorten links, track analytics, generate QR codes, and manage your URLs with ease.

## Features

### Phase 1 - MVP (Current)
- ✅ **URL Shortening** - Generate short URLs from long URLs instantly
- ✅ **Fast Redirects** - Sub-100ms redirect performance with Redis caching
- ✅ **Basic Analytics** - Track click counts and timestamps
- ✅ **Clean UI** - Minimalist, user-friendly interface following 2026 design trends

### Phase 2 - Enhanced Features (Planned)
- 🔐 **User Accounts** - Registration, login, and JWT authentication
- 🎨 **Custom Aliases** - Create memorable short links
- 📊 **Advanced Analytics** - Device tracking, geographic data, referrer tracking
- 📈 **Charts & Visualizations** - Beautiful analytics dashboards

### Phase 3 - Premium Features (Planned)
- 📱 **QR Code Generation** - Auto-generate QR codes for short URLs
- 🔗 **Branded Links** - Custom domain support
- 📥 **Bulk Operations** - Import/export URLs in bulk
- 🔌 **API Access** - Programmatic access with API keys

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
url_shortner/
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API.md              # API documentation
│   ├── DATABASE.md         # Database schema
│   └── DAILY_OPS.md        # Daily operations log
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
│
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   └── package.json
│
├── database/               # Database files
│   ├── migrations/        # SQL migrations
│   └── seeds/             # Seed data
│
└── docker/                 # Docker configs
    ├── docker-compose.yml
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 15 (or use Docker)
- **Redis** >= 7 (or use Docker)

### Option 1: Local Development (without Docker)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd url_shortner
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**
   ```bash
   # Create database
   createdb urlshortener

   # Run migrations
   psql -U postgres -d urlshortener < database/migrations/001_create_users.sql
   psql -U postgres -d urlshortener < database/migrations/002_create_urls.sql
   psql -U postgres -d urlshortener < database/migrations/003_create_clicks.sql

   # (Optional) Load seed data
   psql -U postgres -d urlshortener < database/seeds/dev_data.sql
   ```

4. **Install dependencies and start backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Install dependencies and start frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3005

### Option 2: Docker Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd url_shortner
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # The default values work with Docker
   ```

3. **Start all services**
   ```bash
   cd docker
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3005
   - PostgreSQL: localhost:5432
   - Redis: localhost:6380

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Public
- `POST /api/shorten` - Shorten a URL (anonymous)
- `GET /:shortCode` - Redirect to original URL
- `GET /api/url/:shortCode/info` - Get URL info

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Protected (require authentication)
- `GET /api/urls` - List user's URLs
- `POST /api/urls` - Create short URL (with custom alias)
- `GET /api/urls/:id` - Get URL details
- `PUT /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Delete URL
- `GET /api/analytics/:id` - Get analytics
- `GET /api/analytics/:id/export` - Export analytics

See [docs/API.md](docs/API.md) for complete API documentation.

## Database Schema

### Tables
- **users** - User accounts
- **urls** - URL mappings and metadata
- **clicks** - Analytics data

See [docs/DATABASE.md](docs/DATABASE.md) for complete schema documentation.

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Testing

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run in watch mode
npm run test:coverage   # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

See [.env.example](.env.example) for all available environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `BASE_URL` - Base URL for short links
- `PORT` - Backend server port

## Deployment

### Production Deployment

1. **Build the application**
   ```bash
   # Backend
   cd backend && npm run build

   # Frontend
   cd frontend && npm run build
   ```

2. **Set environment variables**
   - Set `NODE_ENV=production`
   - Update `JWT_SECRET` with a secure random string
   - Configure production database and Redis URLs

3. **Run migrations**
   ```bash
   psql -U postgres -d urlshortener < database/migrations/*.sql
   ```

4. **Start the services**
   ```bash
   # Backend
   cd backend && npm start

   # Frontend (serve with nginx or similar)
   # The build folder is in frontend/dist
   ```

### Deployment Options

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

**Backend:**
- Railway
- Render
- AWS EC2
- DigitalOcean

**Database:**
- Supabase (PostgreSQL)
- Neon (PostgreSQL)
- AWS RDS
- Upstash (Redis)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guides.

## Performance

- **Target redirect time:** <100ms (95th percentile)
- **Cache hit rate:** >90% for hot URLs
- **Database queries:** Optimized with indexes
- **API response time:** <200ms average

## Security

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT authentication with expiration
- ✅ Rate limiting (per IP and per user)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention
- ✅ HTTPS enforcement (production)

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture and design
- [API.md](docs/API.md) - Complete API documentation
- [DATABASE.md](docs/DATABASE.md) - Database schema and queries
- [DAILY_OPS.md](docs/DAILY_OPS.md) - Daily operations log

## Roadmap

### Version 1.0 (MVP) ✅
- [x] Basic URL shortening
- [x] Fast redirects with caching
- [x] Basic analytics
- [x] Clean, minimalist UI
- [x] Docker setup
- [x] Complete documentation

### Version 1.1 (User System)
- [ ] User registration and login
- [ ] JWT authentication
- [ ] User dashboard
- [ ] Custom aliases
- [ ] Link management (edit/delete)

### Version 1.2 (Analytics)
- [ ] Advanced click tracking
- [ ] Device and browser detection
- [ ] Geographic data
- [ ] Analytics dashboard with charts
- [ ] Export functionality

### Version 2.0 (Premium Features)
- [ ] QR code generation
- [ ] Custom domains
- [ ] Bulk operations
- [ ] Public API with rate limiting
- [ ] Webhooks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Resources

**Design Inspiration:**
- [Bitly](https://bitly.com)
- [TinyURL](https://tinyurl.com)

**System Design:**
- [DesignGurus URL Shortener](https://www.designgurus.io/answers/detail/guide-to-designing-a-url-shortener)
- [AlgoMaster System Design](https://algomaster.io/learn/system-design-interviews/design-url-shortener)

## Support

For issues and questions:
- Create an issue on GitHub
- Check [docs/](docs/) for detailed documentation
- Review [docs/DAILY_OPS.md](docs/DAILY_OPS.md) for implementation notes

---

Built with ❤️ following industry best practices from Bitly, TinyURL, and 2026 design standards.
