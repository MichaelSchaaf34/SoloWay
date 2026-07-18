/**
 * Sentry error monitoring. Must be imported before the rest of the app.
 *
 * Enabled only when SENTRY_DSN is set, so local development and tests run
 * without a Sentry account. Scope is error capture (no performance tracing).
 */

import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export function isSentryEnabled() {
  return Boolean(process.env.SENTRY_DSN);
}
