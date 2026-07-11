import { API_BASE_URL } from './env';

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

let getAccessToken = () => null;
let onUnauthorized = null;
let refreshAccessToken = null;
let refreshPromise = null;

export function configureApiClient({ getToken, handleUnauthorized, refreshToken } = {}) {
  if (typeof getToken === 'function') {
    getAccessToken = getToken;
  }
  if (typeof handleUnauthorized === 'function') {
    onUnauthorized = handleUnauthorized;
  }
  if (typeof refreshToken === 'function') {
    refreshAccessToken = refreshToken;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = false,
    signal,
    ignoreUnauthorized = false,
    _retriedAfterRefresh = false,
  } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  let hasAuthHeader = false;
  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
      hasAuthHeader = true;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const shouldRefresh =
      response.status === 401 &&
      hasAuthHeader &&
      !ignoreUnauthorized &&
      !_retriedAfterRefresh &&
      refreshAccessToken;

    if (shouldRefresh) {
      try {
        if (!refreshPromise) {
          refreshPromise = Promise.resolve(refreshAccessToken())
            .finally(() => {
              refreshPromise = null;
            });
        }

        const token = await refreshPromise;
        if (token) {
          return apiRequest(path, {
            ...options,
            _retriedAfterRefresh: true,
          });
        }
      } catch {
        // The refresh handler owns session cleanup.
      }
    }

    if (
      response.status === 401 &&
      onUnauthorized &&
      !ignoreUnauthorized &&
      hasAuthHeader
    ) {
      onUnauthorized();
    }

    const validationMessage = payload?.error?.details
      ?.map(detail => detail.message)
      .filter(Boolean)
      .join('. ');
    const message =
      validationMessage ||
      payload?.message ||
      payload?.error?.message ||
      payload?.error ||
      'Unexpected API error occurred';

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
