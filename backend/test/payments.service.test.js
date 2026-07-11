import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  transaction: vi.fn(),
  getStripe: vi.fn(),
  checkoutCreate: vi.fn(),
  checkoutRetrieve: vi.fn(),
  paymentIntentRetrieve: vi.fn(),
  refundCreate: vi.fn(),
}));

vi.mock('../src/shared/database/index.js', () => ({
  query: mocks.query,
  transaction: mocks.transaction,
}));

vi.mock('../src/shared/payments/stripe.js', () => ({
  getStripe: mocks.getStripe,
}));

vi.mock('../src/config/index.js', () => ({
  config: {
    appUrl: 'https://app.soloway.test',
  },
}));

import {
  createCheckout,
  recordChargeRefunded,
  recordDispute,
  recordPaymentSucceeded,
} from '../src/modules/payments/payments.service.js';

function makeExperience(overrides = {}) {
  return {
    id: 'experience-1',
    provider_id: 'provider-1',
    title: 'Server-priced food tour',
    category: 'food',
    location_name: 'Old Town',
    scheduled_time: '18:00:00',
    timezone: 'Europe/Lisbon',
    price_cents: 2500,
    currency: 'usd',
    cancellation_policy: 'Refundable up to 24 hours before start.',
    refund_cutoff_hours: 24,
    is_active: true,
    stripe_account_id: 'acct_provider_1',
    onboarding_status: 'active',
    charges_enabled: true,
    payouts_enabled: true,
    default_commission_bps: 1500,
    ...overrides,
  };
}

function makeCheckoutInput(overrides = {}) {
  return {
    idempotencyKey: 'checkout-request-0001',
    destination: 'lisbon',
    tripStartDate: '2026-08-01',
    tripEndDate: '2026-08-07',
    items: [{
      experienceId: 'experience-1',
      scheduledDate: '2026-08-03',
      priceCents: 1,
    }],
    totalCents: 1,
    ...overrides,
  };
}

function makeOrder(overrides = {}) {
  return {
    id: 'order-1',
    reference: 'SW-TEST',
    user_id: 'user-1',
    provider_id: 'provider-1',
    itinerary_id: null,
    trip_destination: 'lisbon',
    trip_start_date: '2026-08-01',
    trip_end_date: '2026-08-07',
    status: 'pending',
    currency: 'usd',
    subtotal_cents: 2500,
    commission_cents: 375,
    total_cents: 2500,
    paid_at: null,
    fulfilled_at: null,
    stripe_checkout_session_id: null,
    ...overrides,
  };
}

function useStripe() {
  mocks.getStripe.mockReturnValue({
    checkout: {
      sessions: {
        create: mocks.checkoutCreate,
        retrieve: mocks.checkoutRetrieve,
      },
    },
    paymentIntents: {
      retrieve: mocks.paymentIntentRetrieve,
    },
    refunds: {
      create: mocks.refundCreate,
    },
  });
}

describe('payments service security behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStripe();
  });

  it('calculates checkout totals only from server-loaded experience prices', async () => {
    const experience = makeExperience();
    const order = makeOrder();
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [experience] });

    const clientQuery = vi.fn(async sql => {
      if (sql.includes('INSERT INTO orders')) return { rows: [order] };
      return { rows: [] };
    });
    mocks.transaction.mockImplementation(callback => callback({ query: clientQuery }));
    mocks.checkoutCreate.mockResolvedValue({
      id: 'cs_1',
      url: 'https://checkout.stripe.test/cs_1',
      expires_at: 1_786_000_000,
    });

    await createCheckout('user-1', makeCheckoutInput());

    const orderInsert = clientQuery.mock.calls.find(([sql]) => sql.includes('INSERT INTO orders'));
    expect(orderInsert[1][7]).toBe(2500);
    expect(orderInsert[1][8]).toBe(375);

    expect(mocks.checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            quantity: 1,
            price_data: expect.objectContaining({
              unit_amount: 2500,
              currency: 'usd',
            }),
          }),
        ],
        payment_intent_data: expect.objectContaining({
          application_fee_amount: 375,
          transfer_data: { destination: 'acct_provider_1' },
        }),
      }),
      { idempotencyKey: 'checkout-order-1' }
    );

    const paymentInsert = clientQuery.mock.calls.find(
      ([sql]) => sql.includes('INSERT INTO payments')
    );
    expect(paymentInsert[1]).toEqual([
      'order-1',
      2500,
      375,
      2125,
      'usd',
      'cs_1',
    ]);
  });

  it('rejects a checkout containing experiences from different providers', async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          makeExperience(),
          makeExperience({ id: 'experience-2', provider_id: 'provider-2' }),
        ],
      });

    await expect(createCheckout('user-1', makeCheckoutInput({
      items: [
        { experienceId: 'experience-1', scheduledDate: '2026-08-03' },
        { experienceId: 'experience-2', scheduledDate: '2026-08-04' },
      ],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'All experiences in a checkout must use the same provider',
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.checkoutCreate).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'missing from the authoritative query',
      rows: [],
      message: 'One or more experiences are unavailable',
    },
    {
      name: 'inactive',
      rows: [makeExperience({ is_active: false })],
      message: 'One or more experiences are not active',
    },
  ])('rejects an experience that is $name', async ({ rows, message }) => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows });

    await expect(createCheckout('user-1', makeCheckoutInput())).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message,
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.checkoutCreate).not.toHaveBeenCalled();
  });

  it('returns the original Stripe checkout for an idempotent replay', async () => {
    const existing = makeOrder({ stripe_checkout_session_id: 'cs_existing' });
    mocks.query.mockResolvedValueOnce({ rows: [existing] });
    mocks.checkoutRetrieve.mockResolvedValue({
      id: 'cs_existing',
      url: 'https://checkout.stripe.test/cs_existing',
    });

    const result = await createCheckout('user-1', makeCheckoutInput());

    expect(result.checkoutUrl).toBe('https://checkout.stripe.test/cs_existing');
    expect(mocks.checkoutRetrieve).toHaveBeenCalledWith('cs_existing');
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.checkoutCreate).not.toHaveBeenCalled();
  });

  it('rejects a replay while the original checkout is still being created', async () => {
    mocks.query.mockResolvedValueOnce({ rows: [makeOrder()] });

    await expect(createCheckout('user-1', makeCheckoutInput())).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'Checkout is already being created',
    });

    expect(mocks.checkoutCreate).not.toHaveBeenCalled();
  });

  it('refuses fulfillment when the signed Stripe payment does not match the order total', async () => {
    mocks.paymentIntentRetrieve.mockResolvedValue({
      id: 'pi_1',
      amount_received: 2400,
      currency: 'usd',
      metadata: { order_id: 'order-1' },
      latest_charge: null,
    });
    const clientQuery = vi.fn(async sql => {
      if (sql.includes('SELECT * FROM orders')) {
        return { rows: [makeOrder({ status: 'processing' })] };
      }
      throw new Error(`Unexpected query after mismatch: ${sql}`);
    });
    mocks.transaction.mockImplementation(callback => callback({ query: clientQuery }));

    await expect(recordPaymentSucceeded('order-1', 'pi_1')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Stripe payment does not match the order',
    });
    expect(clientQuery).toHaveBeenCalledTimes(1);
  });

  it('does not create duplicate itinerary data when fulfillment is replayed', async () => {
    mocks.paymentIntentRetrieve.mockResolvedValue({
      id: 'pi_1',
      latest_charge: {
        id: 'ch_1',
        transfer: 'tr_1',
      },
    });
    const clientQuery = vi.fn(async sql => {
      if (sql.includes('SELECT * FROM orders')) {
        return {
          rows: [makeOrder({
            status: 'fulfilled',
            itinerary_id: 'itinerary-1',
            stripe_payment_intent_id: 'pi_1',
          })],
        };
      }
      throw new Error(`Unexpected fulfillment query: ${sql}`);
    });
    mocks.transaction.mockImplementation(callback => callback({ query: clientQuery }));

    await expect(recordPaymentSucceeded('order-1', 'pi_1')).resolves.toBeUndefined();

    expect(mocks.transaction).toHaveBeenCalledTimes(2);
    expect(clientQuery).toHaveBeenCalledTimes(2);
    expect(clientQuery.mock.calls.every(([sql]) => (
      sql.trim().startsWith('SELECT * FROM orders')
    ))).toBe(true);
  });

  it.each([
    { amount: 500, amountRefunded: 200, expectedStatus: 'partially_refunded' },
    { amount: 500, amountRefunded: 500, expectedStatus: 'refunded' },
  ])(
    'records $expectedStatus when Stripe reports $amountRefunded of $amount refunded',
    async ({ amount, amountRefunded, expectedStatus }) => {
      const clientQuery = vi.fn(async sql => {
        if (sql.includes('SELECT id FROM orders')) return { rows: [{ id: 'order-1' }] };
        return { rows: [] };
      });
      mocks.transaction.mockImplementation(callback => callback({ query: clientQuery }));

      await recordChargeRefunded({
        payment_intent: 'pi_1',
        amount,
        amount_refunded: amountRefunded,
      });

      expect(clientQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET status = $2'),
        ['order-1', expectedStatus]
      );
      expect(clientQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payments SET status = $2'),
        ['order-1', expectedStatus]
      );
      expect(clientQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE refunds SET status = 'succeeded'"),
        ['order-1']
      );
    }
  );

  it('marks both the order and payment disputed from the Stripe payment intent', async () => {
    const clientQuery = vi.fn().mockResolvedValue({ rows: [] });
    mocks.transaction.mockImplementation(callback => callback({ query: clientQuery }));

    await recordDispute({ payment_intent: 'pi_disputed' });

    expect(clientQuery).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE orders SET status = 'disputed'"),
      ['pi_disputed']
    );
    expect(clientQuery).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE payments SET status = 'disputed'"),
      ['pi_disputed']
    );
  });
});
