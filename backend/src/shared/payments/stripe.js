import Stripe from 'stripe';
import { config } from '../../config/index.js';

let stripe = null;

export function getStripe() {
  if (!config.stripe.secretKey) {
    throw new Error('Stripe is not configured');
  }

  if (!stripe) {
    stripe = new Stripe(config.stripe.secretKey, {
      appInfo: {
        name: 'SoloWay',
        version: '1.0.0',
      },
      maxNetworkRetries: 2,
      timeout: 20_000,
    });
  }

  return stripe;
}
