import Joi from 'joi';

export const joinWaitlistSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email({ minDomainSegments: 2 }).max(254).required(),
    referralCode: Joi.string().trim().max(64).allow('', null),
  }),
};
