import Joi from 'joi';

export const listEventsSchema = {
  query: Joi.object({
    destination: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(100).required(),
    limit: Joi.number().integer().min(1).max(20).default(8),
    // Optional trip window from the home search bar. endDate alone is
    // meaningless, so it is only accepted alongside a startDate.
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date()
      .iso()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().iso().min(Joi.ref('startDate')),
        otherwise: Joi.forbidden(),
      })
      .optional(),
  }),
};
