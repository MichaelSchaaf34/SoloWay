/**
 * Safety validation schemas
 */

import Joi from 'joi';

export const createCheckinSchema = {
  body: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    locationName: Joi.string().max(200).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const scheduleCheckinSchema = {
  body: Joi.object({
    scheduledFor: Joi.date().iso().greater('now').required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    locationName: Joi.string().max(200).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const getSafetyScoreSchema = {
  query: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
};

export const triggerEmergencySchema = {
  body: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    message: Joi.string().max(500).optional(),
  }),
};
