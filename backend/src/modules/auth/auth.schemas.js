/**
 * Authentication validation schemas
 */

import Joi from 'joi';

const strongPassword = Joi.string()
  .min(12)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
  .messages({
    'string.pattern.base': 'Password must include uppercase, lowercase, number, and symbol',
  });

export const registerSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: strongPassword.required().messages({
      'string.min': 'Password must be at least 12 characters',
      'any.required': 'Password is required',
    }),
    displayName: Joi.string().min(2).max(100).optional(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
  }),
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const logoutSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const verifyEmailSchema = {
  body: Joi.object({
    token: Joi.string().hex().length(64).required(),
  }),
};

export const resendVerificationSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().hex().length(64).required(),
    password: strongPassword.required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: strongPassword.required(),
  }),
};
