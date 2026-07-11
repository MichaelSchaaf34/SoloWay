import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../shared/middleware/errorHandler.js';

function formatExperience(experience) {
  return {
    id: experience.id,
    providerId: experience.provider_id,
    providerName: experience.providers?.display_name,
    destinationSlug: experience.destination_slug,
    title: experience.title,
    description: experience.description,
    category: experience.category,
    locationName: experience.location_name,
    scheduledTime: experience.scheduled_time,
    timezone: experience.timezone,
    durationMinutes: experience.duration_minutes,
    priceCents: experience.price_cents,
    currency: experience.currency,
    cancellationPolicy: experience.cancellation_policy,
    refundCutoffHours: experience.refund_cutoff_hours,
    isActive: experience.is_active,
  };
}

function assertValidTimezone(timezone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
  } catch {
    throw new ValidationError('Experience timezone must be a valid IANA timezone');
  }
}

async function findProvider(userId) {
  const supabase = getSupabaseAdmin();
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!provider) throw new NotFoundError('Provider account');
  return provider;
}

export async function listExperiences({ destination, category, limit = 50 }) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('experiences')
    .select('*, providers!inner(display_name, onboarding_status, charges_enabled, payouts_enabled)')
    .eq('is_active', true)
    .eq('providers.onboarding_status', 'active')
    .eq('providers.charges_enabled', true)
    .limit(limit)
    .order('title', { ascending: true });

  if (destination) query = query.eq('destination_slug', destination);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw new Error('Failed to fetch experiences');
  return (data || []).map(formatExperience);
}

export async function createExperience(userId, input) {
  assertValidTimezone(input.timezone);
  const provider = await findProvider(userId);
  if (input.isActive && (!provider.charges_enabled || !provider.payouts_enabled)) {
    throw new ValidationError('Complete Stripe onboarding before activating experiences');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('experiences')
    .insert({
      provider_id: provider.id,
      destination_slug: input.destinationSlug,
      title: input.title,
      description: input.description || null,
      category: input.category,
      location_name: input.locationName || null,
      scheduled_time: input.scheduledTime || null,
      timezone: input.timezone,
      duration_minutes: input.durationMinutes || null,
      price_cents: input.priceCents,
      currency: input.currency,
      cancellation_policy: input.cancellationPolicy,
      refund_cutoff_hours: input.refundCutoffHours,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create experience');
  return formatExperience(data);
}

export async function updateExperience(userId, experienceId, input) {
  if (input.timezone !== undefined) assertValidTimezone(input.timezone);
  const provider = await findProvider(userId);
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('experiences')
    .select('provider_id')
    .eq('id', experienceId)
    .maybeSingle();

  if (!existing) throw new NotFoundError('Experience');
  if (existing.provider_id !== provider.id) {
    throw new AuthorizationError('You do not own this experience');
  }
  if (input.isActive && (!provider.charges_enabled || !provider.payouts_enabled)) {
    throw new ValidationError('Complete Stripe onboarding before activating experiences');
  }

  const fieldMap = {
    title: 'title',
    description: 'description',
    locationName: 'location_name',
    scheduledTime: 'scheduled_time',
    timezone: 'timezone',
    durationMinutes: 'duration_minutes',
    priceCents: 'price_cents',
    cancellationPolicy: 'cancellation_policy',
    refundCutoffHours: 'refund_cutoff_hours',
    isActive: 'is_active',
  };
  const updates = Object.fromEntries(
    Object.entries(fieldMap)
      .filter(([key]) => input[key] !== undefined)
      .map(([key, column]) => [column, input[key]])
  );

  const { data, error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('id', experienceId)
    .select()
    .single();

  if (error) throw new Error('Failed to update experience');
  return formatExperience(data);
}
