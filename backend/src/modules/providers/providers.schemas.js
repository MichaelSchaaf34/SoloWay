import Joi from 'joi';

export const onboardingSchema = {
  body: Joi.object({
    displayName: Joi.string().trim().min(2).max(120).optional(),
  }),
};
