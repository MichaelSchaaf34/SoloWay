const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1';

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    return configured;
  }

  // A production bundle pointing at localhost is always a deploy mistake.
  // vite.config.js also rejects this at build time; this guard covers bundles
  // built elsewhere (e.g. a host that ignores the config).
  if (import.meta.env.PROD) {
    throw new Error(
      'VITE_API_URL is not set. Production builds must point at the deployed API, e.g. https://api.example.com/api/v1'
    );
  }

  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = normalizeBaseUrl(resolveApiBaseUrl());
