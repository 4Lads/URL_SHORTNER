import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config, { validateConfig } from './config/env';
import { testConnection as testDatabaseConnection } from './config/database';
import { connectRedis } from './config/redis';
import { UrlController } from './controllers/url.controller';
import userRoutes from './routes/user.routes';
import urlAuthRoutes from './routes/url.auth.routes';
import analyticsRoutes from './routes/analytics.routes';

// Initialize Express app
const app = express();

// Validate configuration
try {
  validateConfig();
  console.log('✅ Configuration validated');
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
    },
  });
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'URL Shortener API',
      version: '1.0.0',
      description: 'Fast, scalable URL shortening service with authentication',
      endpoints: {
        health: '/health',
        docs: '/api',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me',
        },
        urls: {
          shorten: 'POST /api/shorten',
          redirect: 'GET /:shortCode',
        },
      },
    },
  });
});

// Test endpoint for database and cache
app.get('/api/test', async (_req: Request, res: Response) => {
  try {
    // This is a simple test - we'll implement full functionality later
    res.status(200).json({
      success: true,
      data: {
        message: 'API is working!',
        database: 'Ready to connect',
        cache: 'Ready to connect',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_FAILED',
        message: 'Test endpoint failed',
      },
    });
  }
});

// Authentication routes
app.use('/api/auth', userRoutes);

// Authenticated URL management routes
app.use('/api/urls', urlAuthRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// URL Shortening endpoint (anonymous)
app.post('/api/shorten', UrlController.shortenUrl);

// Redirect endpoint
app.get('/:shortCode', UrlController.redirectToOriginal);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    },
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Connecting to PostgreSQL...');
    await testDatabaseConnection();

    // Connect to Redis
    console.log('🔌 Connecting to Redis...');
    await connectRedis();

    // Start HTTP server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 URL Shortener API Server Started!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`💾 Database: PostgreSQL (${config.databaseHost}:${config.databasePort})`);
      console.log(`⚡ Cache: Redis (${config.redisHost}:${config.redisPort})`);
      console.log('');
      console.log('📚 Endpoints:');
      console.log(`   GET  /health                    - Health check`);
      console.log(`   GET  /api                       - API info`);
      console.log(`   POST /api/auth/register         - Register user`);
      console.log(`   POST /api/auth/login            - Login user`);
      console.log(`   GET  /api/auth/me               - Get current user`);
      console.log(`   GET  /api/urls                  - List user URLs (auth)`);
      console.log(`   POST /api/urls                  - Create URL (auth)`);
      console.log(`   PUT  /api/urls/:id              - Update URL (auth)`);
      console.log(`   DEL  /api/urls/:id              - Delete URL (auth)`);
      console.log(`   POST /api/shorten               - Shorten URL (anonymous)`);
      console.log(`   GET  /:shortCode                - Redirect to URL`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
