/**
 * Request validation middleware using Joi
 */

import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

/**
 * Validate request against a Joi schema
 * @param {Object} schema - Joi schema with body, params, and/or query properties
 */
export function validate(schema) {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: false, // Don't allow unknown keys
      stripUnknown: true, // Remove unknown keys
    };

    const errors = [];

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        errors.push(...error.details.map(d => ({ field: d.path.join('.'), message: d.message, location: 'body' })));
      } else {
        req.body = value;
      }
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        errors.push(...error.details.map(d => ({ field: d.path.join('.'), message: d.message, location: 'params' })));
      } else {
        req.params = value;
      }
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        errors.push(...error.details.map(d => ({ field: d.path.join('.'), message: d.message, location: 'query' })));
      } else {
        req.query = value;
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID parameter
  uuid: Joi.string().uuid().required(),

  // Pagination query parameters
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    cursor: Joi.string().optional(),
    offset: Joi.number().integer().min(0).optional(),
  }),

  // Location (latitude, longitude)
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  }),
};
