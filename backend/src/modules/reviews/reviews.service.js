import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import {
  AppError,
  AuthorizationError,
  NotFoundError,
} from '../../shared/middleware/errorHandler.js';

function formatReview(review) {
  return {
    id: review.id,
    userId: review.user_id,
    reviewerName: review.users?.display_name || 'SoloWay traveler',
    destinationSlug: review.destination_slug,
    rating: review.rating,
    title: review.title || null,
    body: review.body,
    travelStyle: review.travel_style,
    createdAt: review.created_at,
  };
}

export async function listReviews({ destination, limit = 50 }) {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('reviews')
    .select('*, users(display_name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (destination) query = query.eq('destination_slug', destination);

  const { data, error } = await query;
  if (error) throw new Error('Failed to fetch reviews');

  const reviews = (data || []).map(formatReview);

  // Aggregate over all reviews for the filter, not just the returned page.
  let stats = null;
  if (destination) {
    const { data: ratings, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('destination_slug', destination);

    if (!statsError && ratings) {
      const count = ratings.length;
      const averageRating = count
        ? Math.round((ratings.reduce((sum, row) => sum + row.rating, 0) / count) * 10) / 10
        : null;
      stats = { count, averageRating };
    }
  }

  return { reviews, stats };
}

export async function createReview(userId, input) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      destination_slug: input.destinationSlug,
      rating: input.rating,
      title: input.title || null,
      body: input.body,
      travel_style: input.travelStyle,
    })
    .select('*, users(display_name)')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(
        'You have already reviewed this destination. Delete your existing review to write a new one.',
        409,
        'REVIEW_EXISTS'
      );
    }
    throw new Error('Failed to create review');
  }

  return formatReview(data);
}

export async function deleteReview(userId, reviewId) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('reviews')
    .select('id, user_id')
    .eq('id', reviewId)
    .maybeSingle();

  if (!existing) throw new NotFoundError('Review');
  if (existing.user_id !== userId) {
    throw new AuthorizationError('You can only delete your own review');
  }

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw new Error('Failed to delete review');
}
