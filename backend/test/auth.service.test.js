import { createHash } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  hash: vi.fn(),
  compare: vi.fn(),
  sign: vi.fn(),
  verify: vi.fn(),
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: mocks.hash,
    compare: mocks.compare,
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: mocks.sign,
    verify: mocks.verify,
  },
}));

vi.mock('../src/shared/database/supabase.js', () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));

vi.mock('../src/shared/cache/redis.js', () => ({
  cache: {
    get: mocks.cacheGet,
    set: mocks.cacheSet,
    del: mocks.cacheDel,
  },
  cacheKeys: {
    user: userId => `user:${userId}`,
    userSession: userId => `session:${userId}`,
  },
}));

vi.mock('../src/shared/email/mailer.js', () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
}));

vi.mock('../src/config/index.js', () => ({
  config: {
    appUrl: 'https://app.soloway.test',
    jwt: {
      secret: 'access-secret',
      refreshSecret: 'refresh-secret',
      expiresIn: '15m',
      refreshExpiresIn: '30d',
      algorithm: 'HS256',
      issuer: 'soloway-api',
      accessAudience: 'soloway-client',
      refreshAudience: 'soloway-refresh',
    },
  },
}));

import {
  login,
  logout,
  refreshToken,
  register,
  verifyEmail,
} from '../src/modules/auth/auth.service.js';

function createQuery(result) {
  const query = {};
  for (const method of ['select', 'eq', 'is', 'insert', 'update']) {
    query[method] = vi.fn(() => query);
  }
  query.single = vi.fn(async () => result);
  query.maybeSingle = vi.fn(async () => result);
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return query;
}

function useSupabaseResults(resultsByTable) {
  const queues = Object.fromEntries(
    Object.entries(resultsByTable).map(([table, results]) => [
      table,
      results.map(createQuery),
    ])
  );
  const positions = {};
  const from = vi.fn(table => {
    const position = positions[table] || 0;
    const query = queues[table]?.[position];
    positions[table] = position + 1;
    if (!query) {
      throw new Error(`Unexpected Supabase query for ${table} at index ${position}`);
    }
    return query;
  });
  mocks.getSupabaseAdmin.mockReturnValue({ from });
  return { from, queries: queues };
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

describe('authentication service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hash.mockResolvedValue('hashed-password');
    mocks.compare.mockResolvedValue(true);
    mocks.cacheSet.mockResolvedValue(undefined);
    mocks.cacheDel.mockResolvedValue(undefined);
    mocks.sendVerificationEmail.mockResolvedValue(undefined);
  });

  it('registers a normalized user and requires email verification without issuing session tokens', async () => {
    const { queries } = useSupabaseResults({
      users: [
        { data: null },
        {
          data: {
            id: 'user-1',
            email: 'traveler@example.com',
            display_name: 'Traveler',
            created_at: '2026-07-11T00:00:00.000Z',
          },
          error: null,
        },
      ],
      auth_email_tokens: [
        { error: null },
        { error: null },
      ],
    });

    const result = await register({
      email: 'TRAVELER@EXAMPLE.COM',
      password: 'SoloWay!2026secure',
      displayName: 'Traveler',
    });

    expect(mocks.hash).toHaveBeenCalledWith('SoloWay!2026secure', 12);
    expect(queries.users[1].insert).toHaveBeenCalledWith(expect.objectContaining({
      email: 'traveler@example.com',
      password_hash: 'hashed-password',
    }));
    expect(result).toMatchObject({
      requiresEmailVerification: true,
      user: {
        id: 'user-1',
        emailVerified: false,
      },
    });
    expect(result).not.toHaveProperty('accessToken');
    expect(mocks.sign).not.toHaveBeenCalled();
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(
      'traveler@example.com',
      expect.stringMatching(/^https:\/\/app\.soloway\.test\/verify-email\?token=[a-f0-9]{64}$/)
    );
  });

  it('rejects a correct password when the account email is unverified', async () => {
    useSupabaseResults({
      users: [{
        data: {
          id: 'user-1',
          email: 'traveler@example.com',
          password_hash: 'stored-hash',
          email_verified_at: null,
        },
        error: null,
      }],
    });

    await expect(login('traveler@example.com', 'correct-password')).rejects.toMatchObject({
      code: 'AUTHENTICATION_ERROR',
      message: 'Please verify your email before signing in',
    });
    expect(mocks.compare).toHaveBeenCalledWith('correct-password', 'stored-hash');
    expect(mocks.sign).not.toHaveBeenCalled();
    expect(mocks.cacheSet).not.toHaveBeenCalled();
  });

  it('issues and stores tokens only after verified credentials pass', async () => {
    const { queries } = useSupabaseResults({
      users: [
        {
          data: {
            id: 'user-1',
            email: 'traveler@example.com',
            password_hash: 'stored-hash',
            display_name: 'Traveler',
            avatar_url: null,
            visibility_mode: 'public',
            email_verified_at: '2026-07-10T00:00:00.000Z',
            created_at: '2026-07-01T00:00:00.000Z',
          },
          error: null,
        },
        { error: null },
      ],
      auth_refresh_tokens: [{ error: null }],
    });
    mocks.sign
      .mockReturnValueOnce('new-access-token')
      .mockReturnValueOnce('new-refresh-token');

    const result = await login('TRAVELER@EXAMPLE.COM', 'correct-password');

    expect(result).toMatchObject({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: { id: 'user-1', emailVerified: true },
    });
    expect(queries.auth_refresh_tokens[0].insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      token_hash: sha256('new-refresh-token'),
    }));
    expect(mocks.cacheSet).toHaveBeenCalledWith(
      'session:user-1',
      expect.objectContaining({ loggedInAt: expect.any(String) }),
      86400
    );
  });

  it('detects refresh-token replay and revokes the user token family', async () => {
    const { queries } = useSupabaseResults({
      auth_refresh_tokens: [
        {
          data: {
            user_id: 'user-1',
            expires_at: '2999-01-01T00:00:00.000Z',
            revoked_at: '2026-07-11T00:00:00.000Z',
          },
          error: null,
        },
        { error: null },
      ],
    });
    mocks.verify.mockReturnValue({ userId: 'user-1', type: 'refresh' });

    await expect(refreshToken('replayed-refresh-token')).rejects.toMatchObject({
      code: 'AUTHENTICATION_ERROR',
      message: 'Refresh token revoked',
    });
    expect(queries.auth_refresh_tokens[1].update).toHaveBeenCalledWith({
      revoked_at: expect.any(String),
    });
    expect(queries.auth_refresh_tokens[1].eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(queries.auth_refresh_tokens[1].is).toHaveBeenCalledWith('revoked_at', null);
    expect(mocks.sign).not.toHaveBeenCalled();
  });

  it('enforces one-time email tokens with an atomic consume check', async () => {
    useSupabaseResults({
      auth_email_tokens: [
        {
          data: {
            id: 'email-token-1',
            user_id: 'user-1',
            expires_at: '2999-01-01T00:00:00.000Z',
            consumed_at: null,
          },
        },
        { data: null, error: null },
      ],
    });

    await expect(verifyEmail('a'.repeat(64))).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Authentication token has already been used',
    });
  });

  it('logs out idempotently by revoking all user refresh tokens and clearing the session cache', async () => {
    const { queries } = useSupabaseResults({
      auth_refresh_tokens: [
        { data: { user_id: 'user-1' } },
        { data: { user_id: 'user-1' }, error: null },
      ],
    });

    await expect(logout('refresh-token')).resolves.toBeUndefined();

    expect(mocks.cacheDel).toHaveBeenCalledWith('session:user-1');
    expect(queries.auth_refresh_tokens[1].eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(queries.auth_refresh_tokens[1].is).toHaveBeenCalledWith('revoked_at', null);
  });
});
