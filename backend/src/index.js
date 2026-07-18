import 'dotenv/config';
// Sentry must be initialized before everything else it instruments.
import { isSentryEnabled } from './instrument.js';
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { createServer } from 'http';

import { config, validateConfig } from './config/index.js';
import { logger } from './shared/logging/logger.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { configureRateLimiting, rateLimiter } from './shared/middleware/rateLimiter.js';
import { initializeDatabase, closeDatabase, query } from './shared/database/index.js';
import { initializeRedis, getRedis, closeRedis } from './shared/cache/redis.js';
import { initializeWebSocket, closeWebSocket } from './shared/realtime/websocket.js';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import itineraryRoutes from './modules/itineraries/itineraries.routes.js';
import safetyRoutes from './modules/safety/safety.routes.js';
import socialRoutes from './modules/social/social.routes.js';
import buddyRoutes from './modules/buddy/buddy.routes.js';
import waitlistRoutes from './modules/waitlist/waitlist.routes.js';
import providerRoutes from './modules/providers/providers.routes.js';
import experienceRoutes from './modules/experiences/experiences.routes.js';
import eventRoutes from './modules/events/events.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();
const httpServer = createServer(app);

/**
 * Run a dependency probe with a timeout so a hung connection can never
 * stall the health endpoint (load balancers expect fast answers).
 */
async function probe(label, fn, timeoutMs = 2500) {
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} probe timed out`)), timeoutMs);
        timer.unref();
      }),
    ]);
    return 'ok';
  } catch (error) {
    logger.error({ err: error }, `Health check: ${label} failed`);
    return 'error';
  }
}

// Initialize services
async function bootstrap() {
  try {
    validateConfig();
    const apiPrefix = `/api/${config.apiVersion}`;

    // Security defaults
    app.disable('x-powered-by');
    if (config.env === 'production') {
      app.set('trust proxy', 1);
    }

    // Initialize database connection pool
    await initializeDatabase();
    logger.info('Database connected');

    // Initialize Redis
    const redisClient = await initializeRedis();
    if (!redisClient && config.env === 'production') {
      throw new Error('Redis is required in production for distributed security controls');
    }
    logger.info(redisClient ? 'Redis connected' : 'Redis skipped (unavailable)');
    configureRateLimiting(redisClient);

    // Initialize WebSocket server
    initializeWebSocket(httpServer);
    logger.info('WebSocket server initialized');

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: config.cors.origin,
      credentials: true,
    }));

    // Stripe signature verification requires the untouched request body.
    app.use(`${apiPrefix}/webhooks`, webhookRoutes);

    // Request parsing
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: false, limit: '1mb' }));

    // Compression
    app.use(compression());

    // Structured request logging
    if (config.env !== 'test') {
      app.use(pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
        customLogLevel: (req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        serializers: {
          req: (req) => ({ method: req.method, url: req.url, remoteAddress: req.remoteAddress }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      }));
    }

    // Rate limiting
    app.use(rateLimiter);

    // Health check endpoint — verifies critical dependencies, not just the process
    app.get('/health', async (req, res) => {
      const database = await probe('database', () => query('SELECT 1'));
      const redisConn = getRedis();
      const redis = redisConn ? await probe('redis', () => redisConn.ping()) : 'disabled';

      const healthy = database === 'ok' && redis !== 'error';
      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
        uptime_seconds: Math.round(process.uptime()),
        checks: { database, redis },
      });
    });

    // API routes
    app.use(`${apiPrefix}/auth`, authRoutes);
    app.use(`${apiPrefix}/users`, userRoutes);
    app.use(`${apiPrefix}/itineraries`, itineraryRoutes);
    app.use(`${apiPrefix}/safety`, safetyRoutes);
    app.use(`${apiPrefix}/social`, socialRoutes);
    app.use(`${apiPrefix}/buddy`, buddyRoutes);
    app.use(`${apiPrefix}/waitlist`, waitlistRoutes);
    app.use(`${apiPrefix}/providers`, providerRoutes);
    app.use(`${apiPrefix}/experiences`, experienceRoutes);
    app.use(`${apiPrefix}/events`, eventRoutes);
    app.use(`${apiPrefix}/reviews`, reviewRoutes);
    app.use(`${apiPrefix}/payments`, paymentRoutes);
    app.use(`${apiPrefix}/admin`, adminRoutes);

    // Error handling (Sentry reports first, then our handler shapes the response)
    app.use(notFoundHandler);
    if (isSentryEnabled()) {
      Sentry.setupExpressErrorHandler(app, {
        // Report unexpected failures only; operational 4xx rejections are just noise.
        shouldHandleError: (error) => (error.statusCode || error.status || 500) >= 500,
      });
    }
    app.use(errorHandler);

    // Start server (0.0.0.0 required for PaaS / Docker — not only localhost)
    httpServer.listen(config.port, '0.0.0.0', () => {
      logger.info({ port: config.port, env: config.env }, 'SoloWay API listening');
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown: stop accepting connections, then release resources.
let shuttingDown = false;

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ reason }, 'Shutting down gracefully...');

  // Failsafe: never hang forever on a connection that refuses to drain.
  const failsafe = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10000);
  failsafe.unref();

  try {
    await closeWebSocket(); // disconnects clients; also closes the attached HTTP server
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        // Already closed via Socket.io is fine.
        if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') reject(err);
        else resolve();
      });
    });
    await closeDatabase();
    await closeRedis();
    logger.info('Shutdown complete');
    process.exit(exitCode);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Last-resort handlers: log with full context, then exit non-zero so the
// platform restarts a clean process instead of running in an unknown state.
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.fatal({ err }, 'Unhandled promise rejection');
  shutdown('unhandledRejection', 1);
});

bootstrap();

export default app;
