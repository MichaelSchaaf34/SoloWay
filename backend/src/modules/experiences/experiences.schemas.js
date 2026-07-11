import Joi from 'joi';

const category = Joi.string().valid('food', 'activity', 'relax', 'culture', 'nightlife', 'other');
const currency = Joi.string().lowercase().pattern(/^[a-z]{3}$/);
const timezone = Joi.string().trim().max(100).pattern(/^(UTC|[A-Za-z_]+\/[A-Za-z0-9_+\-/]+)$/);

export const listExperiencesSchema = {
  query: Joi.object({
    destination: Joi.string().trim().lowercase().max(100).optional(),
    category: category.optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export const createExperienceSchema = {
  body: Joi.object({
    destinationSlug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(100).required(),
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    category: category.required(),
    locationName: Joi.string().trim().max(200).allow('').optional(),
    scheduledTime: Joi.string().pattern(/^([0-1]\d|2[0-3]):[0-5]\d$/).optional(),
    timezone: timezone.default('UTC'),
    durationMinutes: Joi.number().integer().min(15).max(1440).optional(),
    priceCents: Joi.number().integer().min(0).max(10_000_000).required(),
    currency: currency.default('usd'),
    cancellationPolicy: Joi.string().trim().min(10).max(1000).optional(),
    refundCutoffHours: Joi.number().integer().min(0).max(720).default(24),
    isActive: Joi.boolean().default(false),
  }),
};

export const experienceIdSchema = {
  params: Joi.object({
    experienceId: Joi.string().uuid().required(),
  }),
};

export const updateExperienceSchema = {
  ...experienceIdSchema,
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    locationName: Joi.string().trim().max(200).allow('').optional(),
    scheduledTime: Joi.string().pattern(/^([0-1]\d|2[0-3]):[0-5]\d$/).allow(null).optional(),
    timezone: timezone.optional(),
    durationMinutes: Joi.number().integer().min(15).max(1440).allow(null).optional(),
    priceCents: Joi.number().integer().min(0).max(10_000_000).optional(),
    cancellationPolicy: Joi.string().trim().min(10).max(1000).optional(),
    refundCutoffHours: Joi.number().integer().min(0).max(720).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};
