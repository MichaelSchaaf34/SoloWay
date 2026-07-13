import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PenLine, Star, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { DESTINATIONS } from '../components/Destinations';
import useAuth from '../hooks/useAuth';
import { createReview, deleteReview, listReviews } from '../utils/reviewService';

const TRAVEL_STYLE_LABELS = {
  solo: 'Solo trip',
  business: 'Work trip',
  'first-time': 'First solo trip',
};

const EMPTY_FORM = {
  destinationSlug: '',
  rating: 0,
  title: '',
  body: '',
  travelStyle: 'solo',
};

function destinationName(slug) {
  const destination = DESTINATIONS.find(item => item.id === slug);
  return destination ? destination.name : slug;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const Stars = ({ value, size = 'h-4 w-4' }) => (
  <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        className={`${size} ${
          star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
        }`}
      />
    ))}
  </span>
);

const Reviews = () => {
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState('');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitState, setSubmitState] = useState({ saving: false, error: '', success: '' });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Solo traveler reviews | SoloWay';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const loadReviews = useCallback(destination => {
    setLoadState({ loading: true, error: '' });
    listReviews({ destination: destination || undefined, limit: 50 })
      .then(response => {
        setReviews(response?.data?.reviews || []);
        setStats(response?.data?.stats || null);
        setLoadState({ loading: false, error: '' });
      })
      .catch(error => {
        setReviews([]);
        setStats(null);
        setLoadState({ loading: false, error: error.message || 'Could not load reviews right now' });
      });
  }, []);

  useEffect(() => {
    loadReviews(filter);
  }, [filter, loadReviews]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitState.saving) return;

    if (!form.destinationSlug) {
      setSubmitState({ saving: false, error: 'Pick the destination you are reviewing.', success: '' });
      return;
    }
    if (!form.rating) {
      setSubmitState({ saving: false, error: 'Tap a star rating first.', success: '' });
      return;
    }

    setSubmitState({ saving: true, error: '', success: '' });
    try {
      await createReview({
        destinationSlug: form.destinationSlug,
        rating: form.rating,
        title: form.title.trim() || undefined,
        body: form.body.trim(),
        travelStyle: form.travelStyle,
      });
      setForm(EMPTY_FORM);
      setSubmitState({ saving: false, error: '', success: 'Thanks — your review is live.' });
      loadReviews(filter);
    } catch (error) {
      setSubmitState({
        saving: false,
        error: error.message || 'Could not post your review right now',
        success: '',
      });
    }
  };

  const handleDelete = async reviewId => {
    try {
      await deleteReview(reviewId);
      loadReviews(filter);
    } catch (error) {
      setLoadState(prev => ({ ...prev, error: error.message || 'Could not delete the review' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <header className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400">
              Field reports
            </span>
            <h1 className="mt-3 text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] text-slate-900 dark:text-white">
              Reviews from people who went{' '}
              <span className="font-serif-italic bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                alone
              </span>
              .
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              Honest takes from solo travelers and people in town for work — what felt safe,
              what was easy to do alone, and what they would book again.
            </p>
          </header>

          {/* Destination filter */}
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !filter
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              All destinations
            </button>
            {DESTINATIONS.map(destination => (
              <button
                key={destination.id}
                onClick={() => setFilter(destination.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === destination.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {destination.name}
              </button>
            ))}
          </div>

          {filter && stats?.count > 0 && (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Stars value={Math.round(stats.averageRating || 0)} />
              <span className="font-semibold text-slate-900 dark:text-white">{stats.averageRating}</span>
              <span>
                from {stats.count} solo {stats.count === 1 ? 'traveler' : 'travelers'} in {destinationName(filter)}
              </span>
            </div>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
            {/* Write a review */}
            <aside className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-28">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <PenLine className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Write a review</h2>
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="review-destination" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Destination
                    </label>
                    <select
                      id="review-destination"
                      value={form.destinationSlug}
                      onChange={event => setForm(prev => ({ ...prev, destinationSlug: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">Choose a destination…</option>
                      {DESTINATIONS.map(destination => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}, {destination.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Rating
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                          aria-label={`${star} star${star === 1 ? '' : 's'}`}
                          className="p-0.5"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= form.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 hover:text-amber-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-style" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Trip type
                    </label>
                    <select
                      id="review-style"
                      value={form.travelStyle}
                      onChange={event => setForm(prev => ({ ...prev, travelStyle: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      {Object.entries(TRAVEL_STYLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="review-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Headline <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      maxLength={120}
                      value={form.title}
                      onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                      placeholder="Wandered at midnight and felt fine"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="review-body" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Your review
                    </label>
                    <textarea
                      id="review-body"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={5}
                      value={form.body}
                      onChange={event => setForm(prev => ({ ...prev, body: event.target.value }))}
                      placeholder="What was it like on your own? What felt safe, what would you tell the next solo traveler?"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {submitState.error && (
                    <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      {submitState.error}
                    </p>
                  )}
                  {submitState.success && (
                    <p className="rounded-xl bg-teal-50 px-3.5 py-2.5 text-sm text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                      {submitState.success}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitState.saving}
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    {submitState.saving ? 'Posting…' : 'Post review'}
                  </button>
                </form>
              ) : (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Been somewhere on your own? Help the next solo traveler know what to expect.
                  </p>
                  <Link
                    to="/auth"
                    state={{ from: '/reviews' }}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Sign in to write a review
                  </Link>
                </div>
              )}
            </aside>

            {/* Review list */}
            <section aria-label="Traveler reviews">
              {loadState.error && (
                <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  {loadState.error}
                </p>
              )}

              {loadState.loading && (
                <div className="space-y-4" aria-label="Loading reviews">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="h-40 animate-pulse rounded-[24px] bg-white dark:bg-slate-900" />
                  ))}
                </div>
              )}

              {!loadState.loading && reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <article
                      key={review.id}
                      className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Stars value={review.rating} />
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {TRAVEL_STYLE_LABELS[review.travelStyle] || 'Solo trip'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-teal-500" />
                          {destinationName(review.destinationSlug)}
                        </span>
                      </div>

                      {review.title && (
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                          {review.title}
                        </h3>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {review.body}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
                        <span>
                          {review.reviewerName} · {formatDate(review.createdAt)}
                        </span>
                        {user?.id === review.userId && (
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="flex items-center gap-1.5 font-semibold text-rose-500 transition-colors hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loadState.loading && !loadState.error && reviews.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                  <Star className="mx-auto h-8 w-8 text-teal-500" />
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                    No reviews {filter ? `for ${destinationName(filter)} ` : ''}yet.
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Be the first to tell other solo travelers what it was really like.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
