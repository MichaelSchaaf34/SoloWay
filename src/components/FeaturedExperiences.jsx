import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, MapPin, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { listExperiences } from '../utils/experienceService';
import { rotateForDate } from '../utils/destinationRotation';
import { DESTINATIONS } from './Destinations';

const CATEGORY_LABELS = {
  food: 'Food & dining',
  activity: 'Activity',
  relax: 'Wellness',
  culture: 'Culture',
  nightlife: 'Nightlife',
  other: 'Experience',
};

function formatPrice(experience) {
  if (experience.priceCents === 0) return 'Free';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: experience.currency?.toUpperCase() || 'USD',
      maximumFractionDigits: 0,
    }).format(experience.priceCents / 100);
  } catch {
    return `$${(experience.priceCents / 100).toFixed(0)}`;
  }
}

const FeaturedExperiences = ({ rotationDate = new Date() }) => {
  const { isAuthenticated } = useAuth();
  const { setDestination } = useTrip();
  const [experiences, setExperiences] = useState([]);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let active = true;

    listExperiences({ limit: 100 })
      .then(response => {
        if (!active) return;
        setExperiences(response?.data?.experiences || response?.experiences || []);
        setLoadState({ loading: false, error: '' });
      })
      .catch(error => {
        if (!active) return;
        setLoadState({
          loading: false,
          error: error.message || 'Could not load live experiences',
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredDestination = useMemo(() => {
    const activeSlugs = new Set(experiences.map(experience => experience.destinationSlug));
    const availableDestinations = DESTINATIONS.filter(destination => activeSlugs.has(destination.id));
    return rotateForDate(availableDestinations, rotationDate)[0];
  }, [experiences, rotationDate]);

  const featuredExperiences = useMemo(
    () => experiences
      .filter(experience => experience.destinationSlug === featuredDestination?.id)
      .slice(0, 4),
    [experiences, featuredDestination]
  );

  const chooseDestination = () => {
    if (!featuredDestination) return;
    setDestination({
      id: featuredDestination.id,
      name: `${featuredDestination.name}, ${featuredDestination.country}`,
      vibe: featuredDestination.vibe,
    });
  };

  return (
    <section className="relative bg-white py-24 dark:bg-slate-950 lg:py-32" aria-labelledby="live-experiences-heading">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400">
              <Sparkles className="h-3.5 w-3.5" />
              Live from SoloWay
            </span>
            <h2 id="live-experiences-heading" className="text-balance text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold leading-[1.1] text-slate-900 dark:text-white">
              {featuredDestination
                ? `What’s happening in ${featuredDestination.name}.`
                : 'Book something worth remembering.'}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              Real experiences from verified SoloWay providers. The featured destination changes every day.
            </p>
          </div>

          {featuredDestination && (
            <Link
              to={isAuthenticated ? '/explore' : '/auth'}
              onClick={chooseDestination}
              className="group inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 md:self-auto"
            >
              Explore {featuredDestination.name}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {loadState.loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading live experiences">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        )}

        {!loadState.loading && featuredExperiences.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredExperiences.map(experience => (
              <article
                key={experience.id}
                className="flex min-h-64 flex-col rounded-[24px] border border-slate-200/80 bg-slate-50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    {CATEGORY_LABELS[experience.category] || CATEGORY_LABELS.other}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatPrice(experience)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                  {experience.title}
                </h3>
                {experience.description && (
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {experience.description}
                  </p>
                )}

                <div className="mt-auto space-y-2 border-t border-slate-200/80 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                    <span>{experience.locationName || featuredDestination.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span>
                      {experience.scheduledTime?.slice(0, 5) || 'Flexible time'}
                      {experience.durationMinutes ? ` · ${experience.durationMinutes} min` : ''}
                    </span>
                  </p>
                  <p className="pt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Hosted by {experience.providerName || 'a SoloWay provider'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loadState.loading && featuredExperiences.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {loadState.error ? 'Live experiences are taking a short detour.' : 'New provider experiences are coming soon.'}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {loadState.error || 'Check back as SoloWay providers publish bookable experiences.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedExperiences;
