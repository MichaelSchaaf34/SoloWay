import Joi from 'joi';

const pagination = {
  limit: Joi.number().integer().min(1).max(100).default(25),
  offset: Joi.number().integer().min(0).default(0),
};

export const listUsersSchema = {
  query: Joi.object({
    ...pagination,
    search: Joi.string().trim().max(200).allow('').optional(),
  }),
};

export const userIdSchema = {
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
};

export const listWaitlistSchema = {
  query: Joi.object(pagination),
};

export const listExperiencesSchema = {
  query: Joi.object({
    ...pagination,
    providerId: Joi.string().uuid().optional(),
  }),
};

export const updateExperienceSchema = {
  params: Joi.object({
    experienceId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
};

export const listOrdersSchema = {
  query: Joi.object({
    ...pagination,
    status: Joi.string().valid(
      'pending', 'processing', 'paid', 'fulfilled', 'payment_failed',
      'cancelled', 'partially_refunded', 'refunded', 'disputed'
    ).optional(),
  }),
};

export const orderIdSchema = {
  params: Joi.object({
    orderId: Joi.string().uuid().required(),
  }),
};

export const refundOrderSchema = {
  params: Joi.object({
    orderId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow('').optional(),
  }),
};

export const listReviewsSchema = {
  query: Joi.object({
    ...pagination,
    destination: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(100).optional(),
  }),
};

export const reviewIdSchema = {
  params: Joi.object({
    reviewId: Joi.string().uuid().required(),
  }),
};

export const listAuditLogSchema = {
  query: Joi.object(pagination),
};
