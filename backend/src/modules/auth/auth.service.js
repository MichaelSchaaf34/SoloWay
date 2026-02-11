/**
 * Authentication service
 * Handles user authentication, token management, and password operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/index.js';
import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../../shared/middleware/errorHandler.js';

const SALT_ROUNDS = 12;

/**
 * Generate JWT tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
}

/**
 * Hash a refresh token for storage
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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
  await supabase
    .from('auth_refresh_tokens')
    .update({
      revoked_at: new Date().toISOString(),
      replaced_by: replacedBy,
    })
    .eq('token_hash', tokenHash)
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

  // Generate tokens
  const tokens = generateTokens(user.id);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    },
    ...tokens,
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
    .select('id, email, password_hash, display_name, avatar_url, visibility_mode, created_at')
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
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.type !== 'refresh') {
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

    if (tokenRecord.revoked_at) {
      throw new AuthenticationError('Refresh token revoked');
    }

    if (new Date(tokenRecord.expires_at) <= new Date()) {
      await revokeRefreshToken(tokenHash);
      throw new AuthenticationError('Refresh token expired');
    }

    // Verify user still exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new tokens and rotate refresh token
    const newTokens = generateTokens(decoded.userId);
    const newTokenHash = hashToken(newTokens.refreshToken);
    await storeRefreshToken(decoded.userId, newTokens.refreshToken, null);
    await revokeRefreshToken(tokenHash, newTokenHash);

    return newTokens;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token expired');
    }
    throw new AuthenticationError('Invalid refresh token');
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
    .select('id, email, display_name, avatar_url, visibility_mode, created_at')
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
    createdAt: user.created_at,
  };

  // Cache user
  await cache.set(cacheKeys.user(userId), userData, 300);

  return userData;
}

/**
 * Logout user
 */
export async function logout(userId) {
  // Clear cached session
  await cache.del(cacheKeys.userSession(userId));
  const supabase = getSupabaseAdmin();
  await supabase
    .from('auth_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
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
    // Don't reveal if user exists
    return;
  }

  // Generate reset token
  const resetToken = uuidv4();
  const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  // Store reset token (in production, use a separate table)
  await cache.set(`password_reset:${resetToken}`, { userId: user.id, email: user.email }, 3600);

  // TODO: Send email with reset link
  if (config.env !== 'production') {
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token, newPassword) {
  const resetData = await cache.get(`password_reset:${token}`);

  if (!resetData) {
    throw new ValidationError('Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', resetData.userId);

  if (error) {
    throw new Error('Failed to reset password');
  }

  // Delete reset token
  await cache.del(`password_reset:${token}`);
}

/**
 * Change password for authenticated user
 */
export async function changePassword(userId, currentPassword, newPassword) {
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

  // Invalidate user cache
  await cache.del(cacheKeys.user(userId));

  // Revoke all refresh tokens on password change
  await supabase
    .from('auth_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
}
