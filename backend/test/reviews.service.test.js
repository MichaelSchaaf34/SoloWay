import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('../src/shared/database/supabase.js', () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));

import { createReview, deleteReview, listReviews } from '../src/modules/reviews/reviews.service.js';

/**
 * Chainable Supabase query stub: every builder method returns the builder,
 * and each `await` consumes the next queued result.
 */
function stubSupabase(results) {
  let call = 0;
  const builder = {};
  for (const method of ['select', 'order', 'limit', 'eq', 'insert', 'delete', 'single', 'maybeSingle']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve, reject) => Promise.resolve(results[call++]).then(resolve, reject);

  const client = { from: vi.fn(() => builder) };
  mocks.getSupabaseAdmin.mockReturnValue(client);
  return { client, builder };
}

function makeReviewRow(overrides = {}) {
  return {
    id: 'review-1',
    user_id: 'user-1',
    destination_slug: 'reykjavik',
    rating: 5,
    title: 'Wandered at midnight and felt fine',
    body: 'Safest city I have visited alone. The pools are the move after work.',
    travel_style: 'business',
    created_at: '2026-07-13T12:00:00Z',
    users: { display_name: 'Micha' },
    ...overrides,
  };
}

describe('reviews service', () => {
  beforeEach(() => {
    mocks.getSupabaseAdmin.mockReset();
  });

  it('lists reviews with reviewer names and destination stats', async () => {
    stubSupabase([
      { data: [makeReviewRow()], error: null },
      { data: [{ rating: 5 }, { rating: 4 }], error: null },
    ]);

    const { reviews, stats } = await listReviews({ destination: 'reykjavik', limit: 10 });

    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({
      id: 'review-1',
      userId: 'user-1',
      reviewerName: 'Micha',
      destinationSlug: 'reykjavik',
      rating: 5,
      travelStyle: 'business',
    });
    expect(stats).toEqual({ count: 2, averageRating: 4.5 });
  });

  it('skips stats and falls back to an anonymous name without a filter', async () => {
    stubSupabase([
      { data: [makeReviewRow({ users: null })], error: null },
    ]);

    const { reviews, stats } = await listReviews({});

    expect(reviews[0].reviewerName).toBe('SoloWay traveler');
    expect(stats).toBeNull();
  });

  it('creates a review and returns the formatted shape', async () => {
    stubSupabase([{ data: makeReviewRow(), error: null }]);

    const review = await createReview('user-1', {
      destinationSlug: 'reykjavik',
      rating: 5,
      body: 'Safest city I have visited alone. The pools are the move after work.',
      travelStyle: 'business',
    });

    expect(review.reviewerName).toBe('Micha');
    expect(review.rating).toBe(5);
  });

  it('maps unique-constraint violations to a 409', async () => {
    stubSupabase([{ data: null, error: { code: '23505' } }]);

    await expect(
      createReview('user-1', { destinationSlug: 'reykjavik', rating: 4, body: 'Great again!', travelStyle: 'solo' })
    ).rejects.toMatchObject({ statusCode: 409, code: 'REVIEW_EXISTS' });
  });

  it('rejects deleting a missing review', async () => {
    stubSupabase([{ data: null, error: null }]);

    await expect(deleteReview('user-1', 'review-404')).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects deleting someone else's review", async () => {
    stubSupabase([{ data: { id: 'review-1', user_id: 'someone-else' }, error: null }]);

    await expect(deleteReview('user-1', 'review-1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('deletes an owned review', async () => {
    const { builder } = stubSupabase([
      { data: { id: 'review-1', user_id: 'user-1' }, error: null },
      { error: null },
    ]);

    await expect(deleteReview('user-1', 'review-1')).resolves.toBeUndefined();
    expect(builder.delete).toHaveBeenCalled();
  });
});
