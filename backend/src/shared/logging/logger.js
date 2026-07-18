/**
 * Structured application logger (pino).
 *
 * Production emits newline-delimited JSON that log aggregators (Render,
 * CloudWatch, Datadog, ...) parse natively. Development pretty-prints.
 */

import pino from 'pino';

const env = process.env.NODE_ENV || 'development';

function resolveLevel() {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  if (env === 'test') return 'silent';
  if (env === 'development') return 'debug';
  return 'info';
}

export const logger = pino({
  level: resolveLevel(),
  base: undefined, // drop pid/hostname noise; the platform adds instance metadata
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.verification_code',
    ],
    censor: '[redacted]',
  },
  ...(env === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
