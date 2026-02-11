/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */

import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';
import { getSupabaseAdmin } from '../database/supabase.js';

/**
 * Authenticate request using JWT token
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database to ensure they still exist and are active
    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, visibility_mode, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, visibility_mode, created_at')
      .eq('id', decoded.userId)
      .single();

    if (user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
}

/**
 * Check if user owns the resource
 */
export function requireOwnership(resourceUserIdField = 'user_id') {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (resourceUserId && resourceUserId !== req.userId) {
      return next(new AuthorizationError('You do not have permission to access this resource'));
    }

    next();
  };
}
