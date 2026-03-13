const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1';

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
);
