import Joi from 'joi';

// --- Reusable param schemas ---

const tokenParams = Joi.object({
  token: Joi.string().hex().length(64).required(),
});

const linkIdParams = Joi.object({
  linkId: Joi.string().uuid().required(),
});

const connectionIdParams = Joi.object({
  connectionId: Joi.string().uuid().required(),
});

// --- Route schemas (body / params / query wrappers) ---

export const createInviteSchema = {
  body: Joi.object({
    itinerary_item_id: Joi.string().uuid().required(),
    party_size_cap: Joi.number().integer().min(2).max(10).default(5),
    token_ttl_minutes: Joi.number().integer().min(5).max(60).default(15),
  }),
};

export const tokenParamSchema = {
  params: tokenParams,
};

export const linkIdParamSchema = {
  params: linkIdParams,
};

export const historyQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    status: Joi.string().valid('pending', 'active', 'expired', 'cancelled').optional(),
  }),
};

export const phoneVerifyWithTokenSchema = {
  params: tokenParams,
  body: Joi.object({
    phone_number: Joi.string()
      .pattern(/^\+[1-9]\d{6,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g. +15551234567)',
      }),
    display_name: Joi.string().trim().max(100).optional(),
  }),
};

export const codeConfirmWithTokenSchema = {
  params: tokenParams,
  body: Joi.object({
    phone_number: Joi.string()
      .pattern(/^\+[1-9]\d{6,14}$/)
      .required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required()
      .messages({
        'string.pattern.base': 'Verification code must be 6 digits',
      }),
  }),
};

export const connectionRespondWithParamSchema = {
  params: connectionIdParams,
  body: Joi.object({
    action: Joi.string().valid('accepted', 'declined').required(),
  }),
};
