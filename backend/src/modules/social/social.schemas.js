/**
 * Social validation schemas
 */

import Joi from 'joi';

export const getNearbySchema = {
  query: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radiusKm: Joi.number().min(0.1).max(50).default(5),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const sendConnectionSchema = {
  body: Joi.object({
    recipientId: Joi.string().uuid().required(),
    message: Joi.string().max(500).optional(),
  }),
};

export const respondConnectionSchema = {
  params: Joi.object({
    connectionId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    accept: Joi.boolean().required(),
  }),
};

export const sendMessageSchema = {
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
  }),
};
