/**
 * Itinerary validation schemas
 */

import Joi from 'joi';

export const createItinerarySchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    destination: Joi.string().min(1).max(200).required(),
    destinationLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    mood: Joi.string().valid('chill', 'adventure', 'balanced').default('balanced'),
    isPublic: Joi.boolean().default(false),
  }),
};

export const updateItinerarySchema = {
  params: Joi.object({
    itineraryId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    destination: Joi.string().min(1).max(200).optional(),
    destinationLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    mood: Joi.string().valid('chill', 'adventure', 'balanced').optional(),
    isPublic: Joi.boolean().optional(),
    status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional(),
  }),
};

export const addItemSchema = {
  params: Joi.object({
    itineraryId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
    locationName: Joi.string().max(200).optional(),
    scheduledDate: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    category: Joi.string().valid('food', 'activity', 'transport', 'accommodation', 'relax', 'culture', 'nightlife', 'other').optional(),
    isFlexible: Joi.boolean().default(false),
  }),
};

export const updateItemSchema = {
  params: Joi.object({
    itineraryId: Joi.string().uuid().required(),
    itemId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional().allow(null),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
    locationName: Joi.string().max(200).optional().allow(null),
    scheduledDate: Joi.date().iso().optional(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
    category: Joi.string().valid('food', 'activity', 'transport', 'accommodation', 'relax', 'culture', 'nightlife', 'other').optional(),
    isFlexible: Joi.boolean().optional(),
  }),
};

export const listItinerariesSchema = {
  query: Joi.object({
    status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    cursor: Joi.string().optional(),
  }),
};

export const nearbyItinerariesSchema = {
  query: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radiusKm: Joi.number().min(1).max(100).default(10),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};
