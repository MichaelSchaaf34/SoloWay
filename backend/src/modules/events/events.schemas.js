import Joi from 'joi';

export const listEventsSchema = {
  query: Joi.object({
    destination: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(100).required(),
    limit: Joi.number().integer().min(1).max(20).default(8),
  }),
};
