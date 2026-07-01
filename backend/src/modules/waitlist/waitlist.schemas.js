/**
 * Waitlist validation schemas
 */

import Joi from 'joi';

export const joinWaitlistSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),
};
