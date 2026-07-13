import crypto from 'node:crypto';
import { query, transaction } from '../../shared/database/index.js';
import { getStripe } from '../../shared/payments/stripe.js';
import { config } from '../../config/index.js';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/middleware/errorHandler.js';

function makeReference() {
  return `SW-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

function toDateOnly(value) {
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);
}

export function calculateOrderTotals(experiences) {
  return experiences.reduce((totals, experience) => {
    const lineTotal = experience.price_cents;
    const commission = Math.round(
      lineTotal * experience.default_commission_bps / 10_000
    );
    return {
      subtotalCents: totals.subtotalCents + lineTotal,
      commissionCents: totals.commissionCents + commission,
    };
  }, { subtotalCents: 0, commissionCents: 0 });
}

function formatOrder(order, items = []) {
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    providerId: order.provider_id,
    itineraryId: order.itinerary_id,
    destination: order.trip_destination,
    tripStartDate: order.trip_start_date,
    tripEndDate: order.trip_end_date,
    currency: order.currency,
    subtotalCents: order.subtotal_cents,
    commissionCents: order.commission_cents,
    totalCents: order.total_cents,
    paidAt: order.paid_at,
    fulfilledAt: order.fulfilled_at,
    items: items.map(item => ({
      id: item.id,
      experienceId: item.experience_id,
      title: item.title,
      category: item.category,
      locationName: item.location_name,
      scheduledDate: item.scheduled_date,
      scheduledTime: item.scheduled_time,
      timezone: item.timezone,
      quantity: item.quantity,
      unitAmountCents: item.unit_amount_cents,
      lineTotalCents: item.line_total_cents,
      currency: item.currency,
      cancellationPolicy: item.cancellation_policy,
      refundCutoffHours: item.refund_cutoff_hours,
    })),
  };
}

async function loadOrder(orderId, userId = null) {
  const orderResult = await query(
    `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
    [orderId]
  );
  const order = orderResult.rows[0];
  if (!order) throw new NotFoundError('Order');
  if (userId && order.user_id !== userId) {
    throw new AuthorizationError('You do not have access to this order');
  }

  const itemsResult = await query(
    `SELECT * FROM order_line_items WHERE order_id = $1 ORDER BY created_at`,
    [orderId]
  );
  return { order, items: itemsResult.rows };
}

export async function getOrder(userId, orderId) {
  const { order, items } = await loadOrder(orderId, userId);
  return formatOrder(order, items);
}

async function fulfillOrder(orderId) {
  return transaction(async client => {
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    const order = orderResult.rows[0];
    if (!order) throw new NotFoundError('Order');
    if (order.status === 'fulfilled') return order.itinerary_id;
    if (!['paid', 'processing'].includes(order.status)) {
      throw new ConflictError('Order is not ready for fulfillment');
    }

    const itineraryResult = await client.query(
      `INSERT INTO itineraries
        (user_id, title, destination, start_date, end_date, mood, status, is_public)
       VALUES ($1, $2, $3, $4, $5, 'balanced', 'active', false)
       RETURNING id`,
      [
        order.user_id,
        `Trip to ${order.trip_destination}`,
        order.trip_destination,
        order.trip_start_date,
        order.trip_end_date,
      ]
    );
    const itineraryId = itineraryResult.rows[0].id;

    const itemsResult = await client.query(
      `SELECT * FROM order_line_items WHERE order_id = $1 ORDER BY created_at`,
      [orderId]
    );
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO itinerary_items
          (itinerary_id, title, location_name, scheduled_date, start_time, category, external_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          itineraryId,
          item.title,
          item.location_name,
          item.scheduled_date,
          item.scheduled_time,
          item.category,
          item.id,
        ]
      );
    }

    await client.query(
      `UPDATE orders
       SET status = 'fulfilled', itinerary_id = $2, fulfilled_at = NOW()
       WHERE id = $1`,
      [orderId, itineraryId]
    );
    return itineraryId;
  });
}

export async function createCheckout(userId, input) {
  const existingResult = await query(
    `SELECT * FROM orders WHERE user_id = $1 AND idempotency_key = $2 LIMIT 1`,
    [userId, input.idempotencyKey]
  );
  const existing = existingResult.rows[0];
  if (existing?.stripe_checkout_session_id) {
    const session = await getStripe().checkout.sessions.retrieve(
      existing.stripe_checkout_session_id
    );
    return {
      order: formatOrder(existing),
      checkoutUrl: session.url,
    };
  }
  if (existing?.status === 'fulfilled') {
    return { order: formatOrder(existing), checkoutUrl: null };
  }
  if (existing) {
    throw new ConflictError('Checkout is already being created');
  }

  const experienceIds = input.items.map(item => item.experienceId);
  const experienceResult = await query(
    `SELECT e.*, p.stripe_account_id, p.onboarding_status, p.charges_enabled,
            p.payouts_enabled, p.default_commission_bps
     FROM experiences e
     JOIN providers p ON p.id = e.provider_id
     WHERE e.id = ANY($1::uuid[])`,
    [experienceIds]
  );
  const experiences = experienceResult.rows;

  if (experiences.length !== experienceIds.length) {
    throw new ValidationError('One or more experiences are unavailable');
  }
  if (experiences.some(item => !item.is_active)) {
    throw new ValidationError('One or more experiences are not active');
  }

  const providerIds = new Set(experiences.map(item => item.provider_id));
  if (providerIds.size !== 1) {
    throw new ValidationError('All experiences in a checkout must use the same provider');
  }
  const currencies = new Set(experiences.map(item => item.currency));
  if (currencies.size !== 1) {
    throw new ValidationError('All experiences in a checkout must use the same currency');
  }

  const provider = experiences[0];
  if (
    provider.onboarding_status !== 'active' ||
    !provider.charges_enabled ||
    !provider.payouts_enabled ||
    !provider.stripe_account_id
  ) {
    throw new ValidationError('The provider is not ready to accept payments');
  }

  const tripStartDate = toDateOnly(input.tripStartDate);
  const tripEndDate = toDateOnly(input.tripEndDate);
  const startDate = new Date(`${tripStartDate}T00:00:00Z`);
  const endDate = new Date(`${tripEndDate}T00:00:00Z`);
  const dateByExperience = new Map(
    input.items.map(item => [item.experienceId, toDateOnly(item.scheduledDate)])
  );
  for (const scheduledDate of dateByExperience.values()) {
    const date = new Date(`${scheduledDate}T00:00:00Z`);
    if (date < startDate || date > endDate) {
      throw new ValidationError('Experience dates must fall within the trip dates');
    }
  }

  const { subtotalCents, commissionCents } = calculateOrderTotals(experiences);
  const currency = experiences[0].currency;
  const reference = makeReference();

  const order = await transaction(async client => {
    const orderResult = await client.query(
      `INSERT INTO orders
        (reference, user_id, provider_id, trip_destination, trip_start_date,
         trip_end_date, currency, subtotal_cents, commission_cents, total_cents,
         idempotency_key, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $8, $10, 'pending')
       RETURNING *`,
      [
        reference,
        userId,
        experiences[0].provider_id,
        input.destination,
        tripStartDate,
        tripEndDate,
        currency,
        subtotalCents,
        commissionCents,
        input.idempotencyKey,
      ]
    );
    const createdOrder = orderResult.rows[0];

    for (const experience of experiences) {
      const lineCommission = Math.round(
        experience.price_cents * experience.default_commission_bps / 10_000
      );
      await client.query(
        `INSERT INTO order_line_items
          (order_id, experience_id, provider_id, title, category, location_name,
           scheduled_date, scheduled_time, timezone, quantity, unit_amount_cents,
           line_total_cents, commission_cents, currency, cancellation_policy,
           refund_cutoff_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10, $10, $11, $12, $13, $14)`,
        [
          createdOrder.id,
          experience.id,
          experience.provider_id,
          experience.title,
          experience.category,
          experience.location_name,
          dateByExperience.get(experience.id),
          experience.scheduled_time,
          experience.timezone,
          experience.price_cents,
          lineCommission,
          experience.currency,
          experience.cancellation_policy,
          experience.refund_cutoff_hours,
        ]
      );
    }
    return createdOrder;
  });

  if (subtotalCents === 0) {
    await transaction(async client => {
      await client.query(
        `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
        [order.id]
      );
      await client.query(
        `INSERT INTO payments
          (order_id, status, amount_cents, commission_cents, provider_net_cents, currency)
         VALUES ($1, 'succeeded', 0, 0, 0, $2)`,
        [order.id, currency]
      );
    });
    await fulfillOrder(order.id);
    const completed = await loadOrder(order.id, userId);
    return { order: formatOrder(completed.order, completed.items), checkoutUrl: null };
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      client_reference_id: order.id,
      line_items: experiences.map(experience => ({
        quantity: 1,
        price_data: {
          currency: experience.currency,
          unit_amount: experience.price_cents,
          product_data: {
            name: experience.title,
            description: experience.location_name || undefined,
            metadata: { experience_id: experience.id },
          },
        },
      })),
      payment_intent_data: {
        application_fee_amount: commissionCents,
        transfer_data: { destination: provider.stripe_account_id },
        metadata: {
          order_id: order.id,
          provider_id: provider.provider_id,
        },
      },
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
      success_url: `${config.appUrl}/booking/return?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/cart?checkout=cancelled&order_id=${order.id}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    }, {
      idempotencyKey: `checkout-${order.id}`,
    });

    await transaction(async client => {
      await client.query(
        `UPDATE orders
         SET stripe_checkout_session_id = $2, checkout_expires_at = to_timestamp($3)
         WHERE id = $1`,
        [order.id, checkoutSession.id, checkoutSession.expires_at]
      );
      await client.query(
        `INSERT INTO payments
          (order_id, status, amount_cents, commission_cents, provider_net_cents,
           currency, stripe_checkout_session_id)
         VALUES ($1, 'pending', $2, $3, $4, $5, $6)`,
        [
          order.id,
          subtotalCents,
          commissionCents,
          subtotalCents - commissionCents,
          currency,
          checkoutSession.id,
        ]
      );
    });

    return {
      order: formatOrder({ ...order, stripe_checkout_session_id: checkoutSession.id }),
      checkoutUrl: checkoutSession.url,
    };
  } catch (error) {
    await query(
      `UPDATE orders SET status = 'payment_failed' WHERE id = $1`,
      [order.id]
    );
    throw error;
  }
}

export async function recordCheckoutCompleted(session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) throw new ValidationError('Stripe session is missing order metadata');

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  if (session.payment_status === 'paid') {
    return recordPaymentSucceeded(orderId, paymentIntentId);
  }

  await query(
    `UPDATE orders SET status = 'processing', stripe_payment_intent_id = $2 WHERE id = $1`,
    [orderId, paymentIntentId || null]
  );
}

export async function recordPaymentSucceeded(orderId, paymentIntentId) {
  const paymentIntent = paymentIntentId
    ? await getStripe().paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
    : null;
  const charge = paymentIntent?.latest_charge;

  await transaction(async client => {
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    const order = orderResult.rows[0];
    if (!order) throw new NotFoundError('Order');
    if (order.status === 'fulfilled') return;

    if (
      paymentIntent &&
      (
        paymentIntent.metadata?.order_id !== orderId ||
        paymentIntent.amount_received !== order.total_cents ||
        paymentIntent.currency !== order.currency
      )
    ) {
      throw new ValidationError('Stripe payment does not match the order');
    }

    await client.query(
      `UPDATE orders
       SET status = 'paid', paid_at = COALESCE(paid_at, NOW()),
           stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id)
       WHERE id = $1`,
      [orderId, paymentIntentId || null]
    );
    await client.query(
      `UPDATE payments
       SET status = 'succeeded', stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
           stripe_charge_id = COALESCE($3, stripe_charge_id),
           stripe_transfer_id = COALESCE($4, stripe_transfer_id)
       WHERE order_id = $1`,
      [
        orderId,
        paymentIntentId || null,
        typeof charge === 'object' ? charge.id : null,
        typeof charge === 'object' ? charge.transfer : null,
      ]
    );
  });

  await fulfillOrder(orderId);
}

export async function recordPaymentFailed(paymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  if (!orderId) return;
  await transaction(async client => {
    await client.query(
      `UPDATE orders SET status = 'payment_failed' WHERE id = $1 AND status <> 'fulfilled'`,
      [orderId]
    );
    await client.query(
      `UPDATE payments
       SET status = 'failed', failure_code = $2, failure_message = $3,
           stripe_payment_intent_id = $4
       WHERE order_id = $1`,
      [
        orderId,
        paymentIntent.last_payment_error?.code || null,
        paymentIntent.last_payment_error?.message || null,
        paymentIntent.id,
      ]
    );
  });
}

async function executeFullRefund(order, requestedBy, reason, stripeReason) {
  if (!['paid', 'fulfilled'].includes(order.status)) {
    throw new ConflictError('Only paid orders can be refunded');
  }
  if (!order.stripe_payment_intent_id) {
    throw new ConflictError('This order does not have a refundable Stripe payment');
  }

  const refund = await getStripe().refunds.create({
    payment_intent: order.stripe_payment_intent_id,
    reverse_transfer: true,
    refund_application_fee: true,
    reason: stripeReason,
    metadata: {
      order_id: order.id,
      requested_by: requestedBy,
      customer_reason: reason || '',
    },
  }, {
    idempotencyKey: `full-refund-${order.id}`,
  });

  const paymentResult = await query(
    `SELECT id FROM payments WHERE order_id = $1 LIMIT 1`,
    [order.id]
  );
  await query(
    `INSERT INTO refunds
      (order_id, payment_id, requested_by, amount_cents, reason, status, stripe_refund_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (stripe_refund_id) DO NOTHING`,
    [
      order.id,
      paymentResult.rows[0].id,
      requestedBy,
      refund.amount,
      reason || null,
      refund.status === 'succeeded' ? 'succeeded' : 'pending',
      refund.id,
    ]
  );

  return { id: refund.id, status: refund.status, amountCents: refund.amount };
}

export async function refundOrder(userId, orderId, reason) {
  const { order } = await loadOrder(orderId, userId);
  if (!['paid', 'fulfilled'].includes(order.status)) {
    throw new ConflictError('Only paid orders can be refunded');
  }

  const refundEligibility = await query(
    `SELECT EXISTS (
       SELECT 1
       FROM order_line_items
       WHERE order_id = $1
         AND NOW() >= (
           (scheduled_date + COALESCE(scheduled_time, TIME '00:00')) AT TIME ZONE timezone
           - make_interval(hours => refund_cutoff_hours)
         )
     ) AS refund_window_closed`,
    [orderId]
  );
  if (refundEligibility.rows[0]?.refund_window_closed) {
    throw new ConflictError('The cancellation deadline for this booking has passed');
  }

  return executeFullRefund(order, userId, reason, 'requested_by_customer');
}

/**
 * Admin-initiated full refund: skips the ownership and cancellation-window
 * checks that apply to traveler-requested refunds.
 */
export async function refundOrderAsAdmin(adminUserId, orderId, reason) {
  const { order } = await loadOrder(orderId);
  return executeFullRefund(order, adminUserId, reason, 'requested_by_customer');
}

export async function recordChargeRefunded(charge) {
  if (!charge.payment_intent) return;
  const status = charge.amount_refunded >= charge.amount ? 'refunded' : 'partially_refunded';
  await transaction(async client => {
    const orderResult = await client.query(
      `SELECT id FROM orders WHERE stripe_payment_intent_id = $1 LIMIT 1`,
      [charge.payment_intent]
    );
    const orderId = orderResult.rows[0]?.id;
    if (!orderId) return;
    await client.query(`UPDATE orders SET status = $2 WHERE id = $1`, [orderId, status]);
    await client.query(`UPDATE payments SET status = $2 WHERE order_id = $1`, [orderId, status]);
    await client.query(
      `UPDATE refunds SET status = 'succeeded' WHERE order_id = $1 AND status = 'pending'`,
      [orderId]
    );
  });
}

export async function recordDispute(charge) {
  if (!charge.payment_intent) return;
  await transaction(async client => {
    await client.query(
      `UPDATE orders SET status = 'disputed' WHERE stripe_payment_intent_id = $1`,
      [charge.payment_intent]
    );
    await client.query(
      `UPDATE payments SET status = 'disputed' WHERE stripe_payment_intent_id = $1`,
      [charge.payment_intent]
    );
  });
}

export async function recordCheckoutExpired(session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) return;
  await transaction(async client => {
    await client.query(
      `UPDATE orders SET status = 'cancelled'
       WHERE id = $1 AND status IN ('pending', 'processing')`,
      [orderId]
    );
    await client.query(
      `UPDATE payments SET status = 'cancelled'
       WHERE order_id = $1 AND status IN ('pending', 'processing')`,
      [orderId]
    );
  });
}

export async function recordRefundUpdate(refund) {
  const status = ['succeeded', 'failed', 'cancelled'].includes(refund.status)
    ? refund.status
    : 'pending';
  await query(
    `UPDATE refunds SET status = $2 WHERE stripe_refund_id = $1`,
    [refund.id, status]
  );
}
