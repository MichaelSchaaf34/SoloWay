import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import DestinationScene from '../components/DestinationScene';
import ExperienceLocationMap from '../components/ExperienceLocationMap';
import { getLiveDestination } from '../utils/liveDestinations';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { getExperience } from '../utils/experienceService';
import { getSuggestedExperienceById } from '../utils/suggestedExperiences';
import { resolveExperienceLocation } from '../utils/experienceLocation';

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

function isSuggestedId(experienceId) {
  return typeof experienceId === 'string' && experienceId.startsWith('suggested-');
}

const ExperienceDetail = () => {
  const { destinationSlug, experienceId } = useParams();
  const destination = getLiveDestination(destinationSlug);
  const { isAuthenticated } = useAuth();
  const { setDestination, addToCart } = useTrip();
  const [liveExperience, setLiveExperience] = useState(null);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });

  const suggestion = useMemo(() => {
    if (!destination || !isSuggestedId(experienceId)) return null;
    return getSuggestedExperienceById(destination.id, experienceId);
  }, [destination, experienceId]);

  useEffect(() => {
    if (!destination) {
      setLoadState({ loading: false, error: '' });
      return undefined;
    }

    if (isSuggestedId(experienceId)) {
      setLiveExperience(null);
      setLoadState({ loading: false, error: suggestion ? '' : 'Experience not found' });
      return undefined;
    }

    let active = true;
    setLoadState({ loading: true, error: '' });

    getExperience(experienceId)
      .then(response => {
        if (!active) return;
        const experience = response?.data?.experience || response?.experience || null;
        if (!experience || experience.destinationSlug !== destination.id) {
          setLiveExperience(null);
          setLoadState({ loading: false, error: 'Experience not found' });
          return;
        }
        setLiveExperience(experience);
        setLoadState({ loading: false, error: '' });
      })
      .catch(error => {
        if (!active) return;
        setLiveExperience(null);
        setLoadState({
          loading: false,
          error: error.message || 'Could not load this experience',
        });
      });

    return () => {
      active = false;
    };
  }, [destination, experienceId, suggestion]);

  const experience = suggestion || liveExperience;
  const isSuggestion = Boolean(suggestion);

  useEffect(() => {
    if (!destination || !experience) return undefined;
    const previousTitle = document.title;
    document.title = `${experience.title} in ${destination.name} | SoloWay`;
    return () => {
      document.title = previousTitle;
    };
  }, [destination, experience]);

  const location = useMemo(() => {
    if (!destination || !experience) return null;
    return resolveExperienceLocation(experience, destination);
  }, [destination, experience]);

  const heroImage = destination?.image?.replace('w=1200', 'w=2000');

  const tripDestination = destination
    ? {
        id: destination.id,
        name: `${destination.name}, ${destination.country}`,
        vibe: destination.vibe,
      }
    : null;

  const rememberDestination = () => {
    if (tripDestination) setDestination(tripDestination);
  };

  const rememberBooking = () => {
    if (!experience || isSuggestion) return;
    rememberDestination();
    addToCart(experience);
  };

  if (!destination) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-950 px-6 pt-28 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Destination not found</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">That stop is not on our map yet.</h1>
            <Link to="/#destinations" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Browse destinations
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadState.loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="container mx-auto px-6 pb-20 pt-36">
          <div className="h-10 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mt-10 h-16 w-2/3 max-w-xl animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-80 animate-pulse rounded-[24px] bg-slate-200 dark:bg-slate-800" />
            <div className="h-80 animate-pulse rounded-[24px] bg-slate-200 dark:bg-slate-800" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!experience || loadState.error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center px-6 pt-28 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Experience not found
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
              That plan is no longer on this stop.
            </h1>
            <Link
              to={`/destinations/${destination.id}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {destination.name}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ctaTo = isSuggestion
    ? isAuthenticated
      ? '/start'
      : '/auth'
    : isAuthenticated
      ? '/cart'
      : '/auth';
  const ctaFrom = isSuggestion ? '/start' : '/cart';
  const ctaLabel = isSuggestion
    ? isAuthenticated
      ? 'Plan this into a trip'
      : 'Create account to plan'
    : isAuthenticated
      ? 'Book experience'
      : 'Create account to book';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <Navbar />

      <main>
        <header
          className="relative overflow-hidden px-6 pb-16 pt-36 text-white lg:pb-20 lg:pt-44"
          style={{ backgroundImage: destination.gradient }}
        >
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: destination.imagePosition }}
          />
          <div className="absolute inset-0 bg-slate-950/40 transition-colors duration-300 dark:bg-slate-950/65" />
          <DestinationScene scene={destination.scene} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/75" />

          <div className="container relative mx-auto">
            <Link
              to={`/destinations/${destination.id}`}
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Experiences in {destination.name}
            </Link>

            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
                  {isSuggestion
                    ? experience.soloTag
                    : CATEGORY_LABELS[experience.category] || CATEGORY_LABELS.other}
                </span>
                {isSuggestion && (
                  <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                    Curated idea
                  </span>
                )}
                <span className="text-lg font-semibold text-white">{formatPrice(experience)}</span>
              </div>

              <h1 className="text-balance text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
                {experience.title}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85">
                {isSuggestion
                  ? experience.soloNote
                  : experience.description || `A bookable experience in ${destination.name}.`}
              </p>
            </div>
          </div>
        </header>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">About this plan</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {isSuggestion
                      ? `${experience.soloNote} Add it to a trip when you are ready — in-app booking opens in ${destination.name} as local providers finish onboarding.`
                      : experience.description ||
                        `Hosted by ${experience.providerName || 'a SoloWay provider'} in ${destination.name}.`}
                  </p>

                  <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">When</dt>
                      <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                        <Clock3 className="h-4 w-4 text-sky-500" />
                        {isSuggestion
                          ? experience.displayTime
                          : experience.scheduledTime?.slice(0, 5) || 'Flexible time'}
                        {!isSuggestion && experience.durationMinutes
                          ? ` · ${experience.durationMinutes} min`
                          : ''}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Where</dt>
                      <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                        <MapPin className="h-4 w-4 text-teal-500" />
                        {experience.locationName || location?.label || destination.name}
                      </dd>
                    </div>
                    {isSuggestion ? (
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Traveler rating
                        </dt>
                        <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {experience.rating} ({experience.reviews} reviews)
                        </dd>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Host</dt>
                        <dd className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                          {experience.providerName || 'SoloWay provider'}
                        </dd>
                      </div>
                    )}
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Solo fit</dt>
                      <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                        <ShieldCheck className="h-4 w-4 text-teal-500" />
                        {isSuggestion ? experience.soloTag : 'Community pick'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {isSuggestion && (
                  <div className="rounded-[24px] border border-teal-200/70 bg-teal-50/70 px-6 py-5 dark:border-teal-900 dark:bg-teal-950/40">
                    <p className="flex items-center gap-2 text-sm font-semibold text-teal-900 dark:text-teal-200">
                      <Sparkles className="h-4 w-4" />
                      Curated while providers onboard
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-teal-800/80 dark:text-teal-300/80">
                      This is a SoloWay idea for how to spend free time in {destination.name}. You can
                      plan it into a trip now; direct booking will land here when inventory goes live.
                    </p>
                  </div>
                )}

                <Link
                  to={ctaTo}
                  state={isAuthenticated ? undefined : { from: ctaFrom }}
                  onClick={isSuggestion ? rememberDestination : rememberBooking}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <aside className="space-y-4">
                <ExperienceLocationMap location={location} />
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  Approximate area in {destination.name}, {destination.country}
                </p>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ExperienceDetail;
