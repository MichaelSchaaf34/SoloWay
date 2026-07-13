/**
 * Authentication service
 * Handles user authentication, token management, and password operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../shared/email/mailer.js';
import { config } from '../../config/index.js';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../../shared/middleware/errorHandler.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TYPE = 'access';
const REFRESH_TOKEN_TYPE = 'refresh';
const VERIFY_EMAIL_TOKEN_TYPE = 'verify_email';
const RESET_PASSWORD_TOKEN_TYPE = 'reset_password';

/**
 * JWT option builders
 */
function getAccessTokenOptions() {
  return {
    expiresIn: config.jwt.expiresIn,
    algorithm: config.jwt.algorithm,
    issuer: config.jwt.issuer,
    audience: config.jwt.accessAudience,
  };
}

function getRefreshTokenOptions() {
  return {
    expiresIn: config.jwt.refreshExpiresIn,
    algorithm: config.jwt.algorithm,
    issuer: config.jwt.issuer,
    audience: config.jwt.refreshAudience,
  };
}

function getRefreshVerifyOptions() {
  return {
    algorithms: [config.jwt.algorithm],
    issuer: config.jwt.issuer,
    audience: config.jwt.refreshAudience,
  };
}

/**
 * Generate JWT tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: ACCESS_TOKEN_TYPE },
    config.jwt.secret,
    getAccessTokenOptions()
  );

  const refreshToken = jwt.sign(
    { userId, type: REFRESH_TOKEN_TYPE },
    config.jwt.refreshSecret,
    getRefreshTokenOptions()
  );

  return { accessToken, refreshToken };
}

/**
 * Hash a token for storage
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createEmailToken(userId, tokenType, ttlSeconds) {
  const supabase = getSupabaseAdmin();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await supabase
    .from('auth_email_tokens')
    .update({ consumed_at: now })
    .eq('user_id', userId)
    .eq('token_type', tokenType)
    .is('consumed_at', null);

  const { error } = await supabase
    .from('auth_email_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      token_type: tokenType,
      expires_at: expiresAt,
    });

  if (error) {
    throw new Error('Failed to create authentication token');
  }

  return token;
}

async function consumeEmailToken(token, tokenType) {
  const supabase = getSupabaseAdmin();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const { data: record } = await supabase
    .from('auth_email_tokens')
    .select('id, user_id, expires_at, consumed_at')
    .eq('token_hash', tokenHash)
    .eq('token_type', tokenType)
    .maybeSingle();

  if (!record || record.consumed_at || new Date(record.expires_at) <= new Date()) {
    throw new ValidationError('Invalid or expired authentication token');
  }

  const { data: consumed, error } = await supabase
    .from('auth_email_tokens')
    .update({ consumed_at: now })
    .eq('id', record.id)
    .is('consumed_at', null)
    .select('user_id')
    .maybeSingle();

  if (error || !consumed) {
    throw new ValidationError('Authentication token has already been used');
  }

  return consumed.user_id;
}

/**
 * Convert a duration string (e.g., "7d", "30d", "1h") to milliseconds
 */
function parseDurationToMs(duration) {
  if (typeof duration === 'number') return duration;
  const match = String(duration).trim().match(/^(\d+)(ms|s|m|h|d)$/i);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] || 0);
}

/**
 * Store refresh token (hashed) in database
 */
async function storeRefreshToken(userId, refreshToken, replacedBy = null) {
  const supabase = getSupabaseAdmin();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(config.jwt.refreshExpiresIn)).toISOString();

  const { error } = await supabase
    .from('auth_refresh_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      replaced_by: replacedBy,
    });

  if (error) {
    throw new Error('Failed to store refresh token');
  }
}

/**
 * Revoke a refresh token
 */
async function revokeRefreshToken(tokenHash, replacedBy = null) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('auth_refresh_tokens')
    .update({
      revoked_at: new Date().toISOString(),
      replaced_by: replacedBy,
    })
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .select('user_id')
    .maybeSingle();

  if (error) {
    throw new Error('Failed to revoke refresh token');
  }

  return data;
}

/**
 * Revoke all active refresh tokens for user
 */
async function revokeAllRefreshTokensForUser(userId) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from('auth_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
}

/**
 * Register a new user
 */
export async function register({ email, password, displayName }) {
  const supabase = getSupabaseAdmin();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
    })
    .select('id, email, display_name, created_at')
    .single();

  if (error) {
    throw new Error('Failed to create user');
  }

  const verificationToken = await createEmailToken(user.id, VERIFY_EMAIL_TOKEN_TYPE, 24 * 60 * 60);
  const verificationUrl = `${config.appUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;
  await sendVerificationEmail(user.email, verificationUrl);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
      emailVerified: false,
    },
    requiresEmailVerification: true,
  };
}

/**
 * Login user with email and password
 */
export async function login(email, password) {
  const supabase = getSupabaseAdmin();

  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, display_name, avatar_url, visibility_mode, is_admin, email_verified_at, created_at')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.email_verified_at) {
    throw new AuthenticationError('Please verify your email before signing in');
  }

  // Update last seen
  await supabase
    .from('users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', user.id);

  // Generate tokens
  const tokens = generateTokens(user.id);
  await storeRefreshToken(user.id, tokens.refreshToken);

  // Cache user session
  await cache.set(cacheKeys.userSession(user.id), { loggedInAt: new Date().toISOString() }, 86400);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      visibilityMode: user.visibility_mode,
      isAdmin: Boolean(user.is_admin),
      emailVerified: Boolean(user.email_verified_at),
      createdAt: user.created_at,
    },
    ...tokens,
  };
}

/**
 * Refresh access token
 */
export async function refreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, getRefreshVerifyOptions());

    if (decoded.type !== REFRESH_TOKEN_TYPE) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokenHash = hashToken(token);

    // Verify token is valid and not revoked
    const supabase = getSupabaseAdmin();
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('auth_refresh_tokens')
      .select('user_id, expires_at, revoked_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (tokenRecord.user_id !== decoded.userId) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (tokenRecord.revoked_at) {
      await revokeAllRefreshTokensForUser(tokenRecord.user_id);
      throw new AuthenticationError('Refresh token revoked');
    }

    if (new Date(tokenRecord.expires_at) <= new Date()) {
      await revokeRefreshToken(tokenHash);
      throw new AuthenticationError('Refresh token expired');
    }

    // Verify user still exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email_verified_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user || !user.email_verified_at) {
      throw new AuthenticationError('User not found');
    }

    // Generate new tokens and rotate refresh token
    const newTokens = generateTokens(decoded.userId);
    const newTokenHash = hashToken(newTokens.refreshToken);
    const rotatedToken = await revokeRefreshToken(tokenHash, newTokenHash);
    if (!rotatedToken) {
      await revokeAllRefreshTokensForUser(decoded.userId);
      throw new AuthenticationError('Refresh token already used');
    }
    await storeRefreshToken(decoded.userId, newTokens.refreshToken, null);

    return newTokens;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token expired');
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      throw new AuthenticationError('Invalid refresh token');
    }

    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  // Try cache first
  const cached = await cache.get(cacheKeys.user(userId));
  if (cached) {
    return cached;
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, visibility_mode, is_admin, email_verified_at, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new NotFoundError('User');
  }

  const userData = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    visibilityMode: user.visibility_mode,
    isAdmin: Boolean(user.is_admin),
    emailVerified: Boolean(user.email_verified_at),
    createdAt: user.created_at,
  };

  // Cache user
  await cache.set(cacheKeys.user(userId), userData, 300);

  return userData;
}

/**
 * Logout user
 */
export async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const supabase = getSupabaseAdmin();
  const { data: tokenRecord } = await supabase
    .from('auth_refresh_tokens')
    .select('user_id')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!tokenRecord) {
    return;
  }

  await Promise.all([
    cache.del(cacheKeys.userSession(tokenRecord.user_id)),
    revokeAllRefreshTokensForUser(tokenRecord.user_id),
  ]);
}

export async function verifyEmail(token) {
  const userId = await consumeEmailToken(token, VERIFY_EMAIL_TOKEN_TYPE);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to verify email');
  }

  await cache.del(cacheKeys.user(userId));
}

export async function resendVerificationEmail(email) {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from('users')
    .select('id, email, email_verified_at')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (!user || user.email_verified_at) {
    return;
  }

  const token = await createEmailToken(user.id, VERIFY_EMAIL_TOKEN_TYPE, 24 * 60 * 60);
  const verificationUrl = `${config.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendVerificationEmail(user.email, verificationUrl);
}

/**
 * Request password reset
 */
export async function forgotPassword(email) {
  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .single();

  if (!user) {
    // Do not reveal if user exists
    return;
  }

  const resetToken = await createEmailToken(user.id, RESET_PASSWORD_TOKEN_TYPE, 60 * 60);
  const resetUrl = `${config.appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

/**
 * Reset password with token
 */
export async function resetPassword(token, newPassword) {
  const userId = await consumeEmailToken(token, RESET_PASSWORD_TOKEN_TYPE);

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to reset password');
  }

  await Promise.all([
    cache.del(cacheKeys.user(userId)),
    cache.del(cacheKeys.userSession(userId)),
    revokeAllRefreshTokensForUser(userId),
  ]);
}

/**
 * Change password for authenticated user
 */
export async function changePassword(userId, currentPassword, newPassword) {
  if (currentPassword === newPassword) {
    throw new ValidationError('New password must be different from current password');
  }

  const supabase = getSupabaseAdmin();

  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new NotFoundError('User');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash and update new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', userId);

  await Promise.all([
    cache.del(cacheKeys.user(userId)),
    cache.del(cacheKeys.userSession(userId)),
    revokeAllRefreshTokensForUser(userId),
  ]);
}




