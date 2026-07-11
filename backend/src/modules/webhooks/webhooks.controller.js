import { config } from '../../config/index.js';
import { getStripe } from '../../shared/payments/stripe.js';
import { processStripeEvent } from './webhooks.service.js';

export async function stripeWebhook(req, res, next) {
  const signature = req.headers['stripe-signature'];
  if (!signature || !config.stripe.webhookSecret) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_WEBHOOK', message: 'Missing webhook signature' },
    });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );
  } catch {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_WEBHOOK', message: 'Invalid webhook signature' },
    });
  }

  try {
    const result = await processStripeEvent(event);
    return res.json({ received: true, duplicate: result.duplicate });
  } catch (error) {
    return next(error);
  }
}
