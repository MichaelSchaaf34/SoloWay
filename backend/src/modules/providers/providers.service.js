import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { getStripe } from '../../shared/payments/stripe.js';
import { config } from '../../config/index.js';
import { NotFoundError } from '../../shared/middleware/errorHandler.js';

function formatProvider(provider) {
  return {
    id: provider.id,
    displayName: provider.display_name,
    onboardingStatus: provider.onboarding_status,
    chargesEnabled: provider.charges_enabled,
    payoutsEnabled: provider.payouts_enabled,
    defaultCommissionBps: provider.default_commission_bps,
    defaultCurrency: provider.default_currency,
  };
}

async function syncProvider(provider) {
  if (!provider.stripe_account_id) return provider;

  const account = await getStripe().accounts.retrieve(provider.stripe_account_id);
  const onboardingStatus =
    account.charges_enabled && account.payouts_enabled
      ? 'active'
      : account.requirements?.disabled_reason
        ? 'restricted'
        : 'pending';

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('providers')
    .update({
      onboarding_status: onboardingStatus,
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
    })
    .eq('id', provider.id)
    .select()
    .single();

  if (error) throw new Error('Failed to synchronize provider status');
  return data;
}

export async function getProviderForUser(userId, { sync = true } = {}) {
  const supabase = getSupabaseAdmin();
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!provider) throw new NotFoundError('Provider account');
  return formatProvider(sync ? await syncProvider(provider) : provider);
}

export async function createOnboardingLink(userId, displayName) {
  const supabase = getSupabaseAdmin();
  let { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!provider) {
    const { data: user } = await supabase
      .from('users')
      .select('email, display_name')
      .eq('id', userId)
      .single();

    if (!user) throw new NotFoundError('User');

    const account = await getStripe().accounts.create({
      type: 'express',
      country: config.stripe.connectCountry,
      email: user.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { soloway_user_id: userId },
    }, {
      idempotencyKey: `provider-account-${userId}`,
    });

    const { data: created, error } = await supabase
      .from('providers')
      .insert({
        user_id: userId,
        display_name: displayName || user.display_name || 'SoloWay provider',
        stripe_account_id: account.id,
        default_commission_bps: config.stripe.defaultCommissionBps,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create provider profile');
    provider = created;
  }

  const accountLink = await getStripe().accountLinks.create({
    account: provider.stripe_account_id,
    refresh_url: `${config.appUrl}/provider/onboarding?refresh=1`,
    return_url: `${config.appUrl}/provider/onboarding?complete=1`,
    type: 'account_onboarding',
  });

  return {
    provider: formatProvider(provider),
    onboardingUrl: accountLink.url,
    expiresAt: accountLink.expires_at,
  };
}

export async function applyStripeAccountUpdate(account) {
  const supabase = getSupabaseAdmin();
  const onboardingStatus =
    account.charges_enabled && account.payouts_enabled
      ? 'active'
      : account.requirements?.disabled_reason
        ? 'restricted'
        : 'pending';

  const { error } = await supabase
    .from('providers')
    .update({
      onboarding_status: onboardingStatus,
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
    })
    .eq('stripe_account_id', account.id);

  if (error) throw new Error('Failed to update provider account');
}
