import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getStripe: vi.fn(),
  constructEvent: vi.fn(),
  processStripeEvent: vi.fn(),
}));

vi.mock('../src/config/index.js', () => ({
  config: {
    stripe: {
      webhookSecret: 'whsec_test',
    },
  },
}));

vi.mock('../src/shared/payments/stripe.js', () => ({
  getStripe: mocks.getStripe,
}));

vi.mock('../src/modules/webhooks/webhooks.service.js', () => ({
  processStripeEvent: mocks.processStripeEvent,
}));

import { stripeWebhook } from '../src/modules/webhooks/webhooks.controller.js';

function makeResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe('Stripe webhook controller signature handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: mocks.constructEvent,
      },
    });
  });

  it('rejects requests without a Stripe signature before processing', async () => {
    const req = {
      headers: {},
      body: Buffer.from('{"id":"evt_1"}'),
    };
    const res = makeResponse();
    const next = vi.fn();

    await stripeWebhook(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INVALID_WEBHOOK',
        message: 'Missing webhook signature',
      },
    });
    expect(mocks.constructEvent).not.toHaveBeenCalled();
    expect(mocks.processStripeEvent).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a payload when Stripe signature verification fails', async () => {
    const rawBody = Buffer.from('{"id":"evt_tampered"}');
    const req = {
      headers: { 'stripe-signature': 'bad-signature' },
      body: rawBody,
    };
    const res = makeResponse();
    const next = vi.fn();
    mocks.constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    await stripeWebhook(req, res, next);

    expect(mocks.constructEvent).toHaveBeenCalledWith(
      rawBody,
      'bad-signature',
      'whsec_test'
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INVALID_WEBHOOK',
        message: 'Invalid webhook signature',
      },
    });
    expect(mocks.processStripeEvent).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('processes only the verified event and reports duplicate delivery state', async () => {
    const rawBody = Buffer.from('{"id":"evt_1"}');
    const event = { id: 'evt_1', type: 'checkout.session.completed' };
    const req = {
      headers: { 'stripe-signature': 'valid-signature' },
      body: rawBody,
    };
    const res = makeResponse();
    const next = vi.fn();
    mocks.constructEvent.mockReturnValue(event);
    mocks.processStripeEvent.mockResolvedValue({ duplicate: true });

    await stripeWebhook(req, res, next);

    expect(mocks.constructEvent).toHaveBeenCalledWith(
      rawBody,
      'valid-signature',
      'whsec_test'
    );
    expect(mocks.processStripeEvent).toHaveBeenCalledWith(event);
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      duplicate: true,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
