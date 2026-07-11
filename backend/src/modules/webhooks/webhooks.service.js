import { query } from '../../shared/database/index.js';
import { getStripe } from '../../shared/payments/stripe.js';
import * as paymentsService from '../payments/payments.service.js';
import { applyStripeAccountUpdate } from '../providers/providers.service.js';

async function claimEvent(event) {
  const inserted = await query(
    `INSERT INTO webhook_events (stripe_event_id, event_type, status)
     VALUES ($1, $2, 'processing')
     ON CONFLICT (stripe_event_id) DO NOTHING
     RETURNING stripe_event_id`,
    [event.id, event.type]
  );
  if (inserted.rowCount === 1) return true;

  const existing = await query(
    `SELECT status FROM webhook_events WHERE stripe_event_id = $1`,
    [event.id]
  );
  if (existing.rows[0]?.status === 'processed') return false;

  const reclaimed = await query(
    `UPDATE webhook_events
     SET status = 'processing', attempts = attempts + 1, last_error = NULL
     WHERE stripe_event_id = $1
       AND (
         status = 'failed'
         OR (status = 'processing' AND updated_at < NOW() - INTERVAL '5 minutes')
       )
     RETURNING stripe_event_id`,
    [event.id]
  );
  if (reclaimed.rowCount === 1) return true;

  throw new Error('Webhook event is already processing');
}

async function markProcessed(eventId) {
  await query(
    `UPDATE webhook_events
     SET status = 'processed', processed_at = NOW(), last_error = NULL
     WHERE stripe_event_id = $1`,
    [eventId]
  );
}

async function markFailed(eventId, error) {
  await query(
    `UPDATE webhook_events
     SET status = 'failed', last_error = $2
     WHERE stripe_event_id = $1`,
    [eventId, String(error.message || 'Webhook processing failed').slice(0, 500)]
  );
}

export async function processStripeEvent(event) {
  if (!(await claimEvent(event))) {
    return { duplicate: true };
  }

  try {
    const object = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await paymentsService.recordCheckoutCompleted(object);
        break;
      case 'checkout.session.async_payment_failed': {
        const paymentIntentId =
          typeof object.payment_intent === 'string'
            ? object.payment_intent
            : object.payment_intent?.id;
        if (paymentIntentId) {
          const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
          await paymentsService.recordPaymentFailed(paymentIntent);
        }
        break;
      }
      case 'checkout.session.expired':
        await paymentsService.recordCheckoutExpired(object);
        break;
      case 'payment_intent.succeeded':
        if (object.metadata?.order_id) {
          await paymentsService.recordPaymentSucceeded(object.metadata.order_id, object.id);
        }
        break;
      case 'payment_intent.payment_failed':
        await paymentsService.recordPaymentFailed(object);
        break;
      case 'charge.refunded':
        await paymentsService.recordChargeRefunded(object);
        break;
      case 'charge.dispute.created':
        await paymentsService.recordDispute(object);
        break;
      case 'refund.updated':
      case 'refund.failed':
        await paymentsService.recordRefundUpdate(object);
        break;
      case 'account.updated':
        await applyStripeAccountUpdate(object);
        break;
      default:
        break;
    }

    await markProcessed(event.id);
    return { duplicate: false };
  } catch (error) {
    await markFailed(event.id, error);
    throw error;
  }
}
