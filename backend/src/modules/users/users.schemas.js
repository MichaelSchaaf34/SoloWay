/**
 * User validation schemas
 */

import Joi from 'joi';

export const updateProfileSchema = {
  body: Joi.object({
    displayName: Joi.string().min(2).max(100).optional(),
    avatarUrl: Joi.string().uri().optional().allow(null),
  }),
};

export const updateLocationSchema = {
  body: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
};

export const updateVisibilitySchema = {
  body: Joi.object({
    visibilityMode: Joi.string().valid('visible', 'invisible', 'friends_only').required(),
  }),
};

export const addContactSchema = {
  body: Joi.object({
    contactName: Joi.string().min(1).max(100).required(),
    contactPhone: Joi.string().optional().allow(null),
    contactEmail: Joi.string().email().optional().allow(null),
    notifyOnCheckin: Joi.boolean().default(true),
    notifyOnEmergency: Joi.boolean().default(true),
  }),
};
