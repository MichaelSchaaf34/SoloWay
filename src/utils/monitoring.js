/**
 * Sentry error monitoring for the browser bundle.
 *
 * Enabled only when VITE_SENTRY_DSN is set at build time, so local dev and
 * open-source builds work without a Sentry account. Unhandled exceptions and
 * promise rejections are captured by the SDK's default global handlers.
 */

import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  });
}
