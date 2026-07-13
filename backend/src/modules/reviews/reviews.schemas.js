import Joi from 'joi';

const destinationSlug = Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(100);
const travelStyle = Joi.string().valid('solo', 'business', 'first-time');

export const listReviewsSchema = {
  query: Joi.object({
    destination: destinationSlug.optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export const createReviewSchema = {
  body: Joi.object({
    destinationSlug: destinationSlug.required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().trim().max(120).allow('').optional(),
    body: Joi.string().trim().min(10).max(2000).required(),
    travelStyle: travelStyle.default('solo'),
  }),
};

export const reviewIdSchema = {
  params: Joi.object({
    reviewId: Joi.string().uuid().required(),
  }),
};
