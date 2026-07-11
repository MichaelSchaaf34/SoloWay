import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API_URL = 'http://localhost:3001/api/v1';

function response(status, payload, contentType = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: vi.fn(() => contentType),
    },
    json: vi.fn(async () => payload),
    text: vi.fn(async () => (typeof payload === 'string' ? payload : '')),
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('apiRequest authentication recovery', () => {
  let apiRequest;
  let configureApiClient;

  beforeEach(async () => {
    vi.resetModules();
    ({ apiRequest, configureApiClient } = await import('./apiClient.js'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the access token and returns a JSON response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, { data: { id: 'user-1' } }));
    vi.stubGlobal('fetch', fetchMock);
    configureApiClient({ getToken: () => 'access-token' });

    await expect(apiRequest('/auth/me', { auth: true })).resolves.toEqual({
      data: { id: 'user-1' },
    });
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/me`, expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
    }));
  });

  it('refreshes once and retries a failed authenticated request with the new token', async () => {
    let token = 'expired-token';
    const refreshToken = vi.fn(async () => {
      token = 'fresh-token';
      return token;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(401, { error: { message: 'Expired' } }))
      .mockResolvedValueOnce(response(200, { data: 'recovered' }));
    vi.stubGlobal('fetch', fetchMock);
    configureApiClient({
      getToken: () => token,
      refreshToken,
      handleUnauthorized: vi.fn(),
    });

    await expect(apiRequest('/private', { auth: true })).resolves.toEqual({ data: 'recovered' });
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer expired-token');
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer fresh-token');
  });

  it('uses a single in-flight refresh for concurrent 401 responses', async () => {
    let token = 'expired-token';
    const refreshResult = deferred();
    const refreshToken = vi.fn(async () => {
      token = await refreshResult.promise;
      return token;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(401, { message: 'Expired' }))
      .mockResolvedValueOnce(response(401, { message: 'Expired' }))
      .mockResolvedValueOnce(response(200, { request: 'first' }))
      .mockResolvedValueOnce(response(200, { request: 'second' }));
    vi.stubGlobal('fetch', fetchMock);
    configureApiClient({ getToken: () => token, refreshToken });

    const requests = Promise.all([
      apiRequest('/private/one', { auth: true }),
      apiRequest('/private/two', { auth: true }),
    ]);

    await vi.waitFor(() => expect(refreshToken).toHaveBeenCalledTimes(1));
    refreshResult.resolve('fresh-token');

    await expect(requests).resolves.toEqual([
      { request: 'first' },
      { request: 'second' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls.slice(2).map(([, options]) => options.headers.Authorization))
      .toEqual(['Bearer fresh-token', 'Bearer fresh-token']);
  });

  it('clears the session and preserves the original API error when refresh fails', async () => {
    const handleUnauthorized = vi.fn();
    const refreshToken = vi.fn().mockRejectedValue(new Error('Refresh unavailable'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      response(401, { error: { message: 'Session expired' } })
    ));
    configureApiClient({
      getToken: () => 'expired-token',
      refreshToken,
      handleUnauthorized,
    });

    await expect(apiRequest('/private', { auth: true })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Session expired',
      status: 401,
    });
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(handleUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not enter a refresh loop when the retried request is also unauthorized', async () => {
    let token = 'expired-token';
    const handleUnauthorized = vi.fn();
    const refreshToken = vi.fn(async () => {
      token = 'fresh-token';
      return token;
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(401, { message: 'Expired' }))
      .mockResolvedValueOnce(response(401, { message: 'Still unauthorized' }));
    vi.stubGlobal('fetch', fetchMock);
    configureApiClient({ getToken: () => token, refreshToken, handleUnauthorized });

    await expect(apiRequest('/private', { auth: true })).rejects.toMatchObject({
      status: 401,
      message: 'Still unauthorized',
    });
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(handleUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('honors ignoreUnauthorized without refreshing or clearing the session', async () => {
    const refreshToken = vi.fn();
    const handleUnauthorized = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(401, { message: 'Expected 401' })));
    configureApiClient({
      getToken: () => 'access-token',
      refreshToken,
      handleUnauthorized,
    });

    await expect(apiRequest('/auth/refresh', {
      auth: true,
      ignoreUnauthorized: true,
    })).rejects.toMatchObject({ status: 401 });
    expect(refreshToken).not.toHaveBeenCalled();
    expect(handleUnauthorized).not.toHaveBeenCalled();
  });
});
