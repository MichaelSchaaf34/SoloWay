import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  getStripe: vi.fn(),
  paymentIntentRetrieve: vi.fn(),
  recordCheckoutCompleted: vi.fn(),
  recordCheckoutExpired: vi.fn(),
  recordPaymentSucceeded: vi.fn(),
  recordPaymentFailed: vi.fn(),
  recordChargeRefunded: vi.fn(),
  recordDispute: vi.fn(),
  recordRefundUpdate: vi.fn(),
  applyStripeAccountUpdate: vi.fn(),
}));

vi.mock('../src/shared/database/index.js', () => ({
  query: mocks.query,
}));

vi.mock('../src/shared/payments/stripe.js', () => ({
  getStripe: mocks.getStripe,
}));

vi.mock('../src/modules/payments/payments.service.js', () => ({
  recordCheckoutCompleted: mocks.recordCheckoutCompleted,
  recordCheckoutExpired: mocks.recordCheckoutExpired,
  recordPaymentSucceeded: mocks.recordPaymentSucceeded,
  recordPaymentFailed: mocks.recordPaymentFailed,
  recordChargeRefunded: mocks.recordChargeRefunded,
  recordDispute: mocks.recordDispute,
  recordRefundUpdate: mocks.recordRefundUpdate,
}));

vi.mock('../src/modules/providers/providers.service.js', () => ({
  applyStripeAccountUpdate: mocks.applyStripeAccountUpdate,
}));

import { processStripeEvent } from '../src/modules/webhooks/webhooks.service.js';

function makeEvent(overrides = {}) {
  return {
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_1',
        metadata: { order_id: 'order-1' },
      },
    },
    ...overrides,
  };
}

describe('Stripe webhook processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripe.mockReturnValue({
      paymentIntents: {
        retrieve: mocks.paymentIntentRetrieve,
      },
    });
  });

  it('skips an event that was already processed', async () => {
    mocks.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ status: 'processed' }] });

    await expect(processStripeEvent(makeEvent())).resolves.toEqual({ duplicate: true });

    expect(mocks.recordCheckoutCompleted).not.toHaveBeenCalled();
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });

  it('returns an error for an event still processing so Stripe retries it', async () => {
    mocks.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ status: 'processing' }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(processStripeEvent(makeEvent())).rejects.toThrow(
      'Webhook event is already processing'
    );
    expect(mocks.recordCheckoutCompleted).not.toHaveBeenCalled();
  });

  it('claims, handles, and marks a new event processed', async () => {
    const event = makeEvent();
    mocks.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ stripe_event_id: event.id }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] });

    await expect(processStripeEvent(event)).resolves.toEqual({ duplicate: false });

    expect(mocks.recordCheckoutCompleted).toHaveBeenCalledWith(event.data.object);
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.stringContaining("SET status = 'processed'"),
      ['evt_1']
    );
  });

  it('marks a failed event and permits a later replay to retry it', async () => {
    const event = makeEvent();
    mocks.recordCheckoutCompleted
      .mockRejectedValueOnce(new Error('temporary fulfillment failure'))
      .mockResolvedValueOnce(undefined);
    mocks.query
      // First delivery: claim, then mark failed.
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ stripe_event_id: event.id }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      // Replay: conflict, inspect failed state, claim retry, mark processed.
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ status: 'failed' }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] });

    await expect(processStripeEvent(event)).rejects.toThrow('temporary fulfillment failure');
    await expect(processStripeEvent(event)).resolves.toEqual({ duplicate: false });

    expect(mocks.recordCheckoutCompleted).toHaveBeenCalledTimes(2);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'failed'"),
      ['evt_1', 'temporary fulfillment failure']
    );
    expect(mocks.query).toHaveBeenCalledWith(
      expect.stringContaining('attempts = attempts + 1'),
      ['evt_1']
    );
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.stringContaining("SET status = 'processed'"),
      ['evt_1']
    );
  });

  it.each([
    {
      type: 'charge.refunded',
      handler: 'recordChargeRefunded',
    },
    {
      type: 'charge.dispute.created',
      handler: 'recordDispute',
    },
    {
      type: 'refund.updated',
      handler: 'recordRefundUpdate',
    },
  ])('routes $type to $handler exactly once', async ({ type, handler }) => {
    const object = { id: 'stripe_object_1', payment_intent: 'pi_1' };
    mocks.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ stripe_event_id: 'evt_1' }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] });

    await processStripeEvent(makeEvent({
      type,
      data: { object },
    }));

    expect(mocks[handler]).toHaveBeenCalledTimes(1);
    expect(mocks[handler]).toHaveBeenCalledWith(object);
  });
});
