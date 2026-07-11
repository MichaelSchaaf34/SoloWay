import Joi from 'joi';

export const createCheckoutSchema = {
  body: Joi.object({
    idempotencyKey: Joi.string().trim().min(16).max(128).required(),
    destination: Joi.string().trim().min(1).max(200).required(),
    tripStartDate: Joi.date().iso().required(),
    tripEndDate: Joi.date().iso().min(Joi.ref('tripStartDate')).required(),
    items: Joi.array().items(
      Joi.object({
        experienceId: Joi.string().uuid().required(),
        scheduledDate: Joi.date().iso().required(),
      })
    ).min(1).max(20).unique('experienceId').required(),
  }),
};

export const orderIdSchema = {
  params: Joi.object({
    orderId: Joi.string().uuid().required(),
  }),
};

export const refundOrderSchema = {
  ...orderIdSchema,
  body: Joi.object({
    reason: Joi.string().trim().max(500).optional(),
  }),
};
