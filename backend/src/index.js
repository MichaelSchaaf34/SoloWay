import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';

import { config, validateConfig } from './config/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { rateLimiter } from './shared/middleware/rateLimiter.js';
import { initializeDatabase } from './shared/database/index.js';
import { initializeRedis } from './shared/cache/redis.js';
import { initializeWebSocket } from './shared/realtime/websocket.js';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import itineraryRoutes from './modules/itineraries/itineraries.routes.js';
import safetyRoutes from './modules/safety/safety.routes.js';
import socialRoutes from './modules/social/social.routes.js';
import buddyRoutes from './modules/buddy/buddy.routes.js';

const app = express();
const httpServer = createServer(app);

// Initialize services
async function bootstrap() {
  try {
    validateConfig();

    // Security defaults
    app.disable('x-powered-by');
    if (config.env === 'production') {
      app.set('trust proxy', 1);
    }

    // Initialize database connection pool
    await initializeDatabase();
    console.log('Database connected');

    // Initialize Redis
    const redisClient = await initializeRedis();
    console.log(redisClient ? 'Redis connected' : 'Redis skipped (unavailable)');

    // Initialize WebSocket server
    initializeWebSocket(httpServer);
    console.log('WebSocket server initialized');

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: config.cors.origin,
      credentials: true,
    }));

    // Request parsing
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: false, limit: '1mb' }));

    // Compression
    app.use(compression());

    // Logging
    if (config.env !== 'test') {
      app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
    }

    // Rate limiting
    app.use(rateLimiter);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
      });
    });

    // API routes
    const apiPrefix = `/api/${config.apiVersion}`;
    app.use(`${apiPrefix}/auth`, authRoutes);
    app.use(`${apiPrefix}/users`, userRoutes);
    app.use(`${apiPrefix}/itineraries`, itineraryRoutes);
    app.use(`${apiPrefix}/safety`, safetyRoutes);
    app.use(`${apiPrefix}/social`, socialRoutes);
    app.use(`${apiPrefix}/buddy`, buddyRoutes);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`SoloWay API listening on port ${config.port} (${config.env})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

bootstrap();

export default app;
