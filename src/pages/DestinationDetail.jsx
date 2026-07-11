import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { DESTINATIONS } from '../components/Destinations';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { listExperiences } from '../utils/experienceService';

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

const DestinationDetail = () => {
  const { destinationSlug } = useParams();
  const destination = DESTINATIONS.find(item => item.id === destinationSlug);
  const { isAuthenticated } = useAuth();
  const { setDestination, addToCart } = useTrip();
  const [experiences, setExperiences] = useState([]);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });

  useEffect(() => {
    if (!destination) {
      setLoadState({ loading: false, error: '' });
      return undefined;
    }

    const previousTitle = document.title;
    document.title = `${destination.name} solo travel experiences | SoloWay`;
    let active = true;

    setLoadState({ loading: true, error: '' });
    listExperiences({ destination: destination.id, limit: 24 })
      .then(response => {
        if (!active) return;
        setExperiences(response?.data?.experiences || response?.experiences || []);
        setLoadState({ loading: false, error: '' });
      })
      .catch(error => {
        if (!active) return;
        setExperiences([]);
        setLoadState({
          loading: false,
          error: error.message || 'Could not load experiences right now',
        });
      });

    return () => {
      active = false;
      document.title = previousTitle;
    };
  }, [destination]);

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

  const rememberBooking = experience => {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <Navbar />

      <main>
        <header
          className="relative overflow-hidden px-6 pb-20 pt-36 text-white lg:pb-28 lg:pt-44"
          style={{ backgroundImage: destination.gradient }}
        >
          <div className="absolute inset-0 bg-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/70" />
          <div className="container relative mx-auto">
            <Link to="/#destinations" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              All destinations
            </Link>

            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
                  {destination.vibe}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  {destination.country}
                </span>
              </div>
              <h1 className="text-balance text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tight">
                {destination.name}
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 md:text-xl">
                {destination.desc}
              </p>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-black/20 p-4 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Best time</p>
                <p className="mt-1 font-semibold text-white">{destination.bestTime}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/20 p-4 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Avg / day</p>
                <p className="mt-1 font-semibold text-white">${destination.avgPerDay}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/20 bg-black/20 p-4 backdrop-blur-md sm:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Solo fit</p>
                <p className="mt-1 flex items-center gap-1.5 font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-teal-300" />
                  Community pick
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white py-20 dark:bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Start exploring</span>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">A good day in {destination.name}</h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Build your own day around local culture, social experiences, and the places that make this destination memorable.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {destination.highlights.map((highlight, index) => (
                  <div key={highlight} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      {index + 1}
                    </span>
                    <p className="mt-4 font-semibold text-slate-900 dark:text-white">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 dark:bg-slate-900" aria-labelledby="destination-experiences">
          <div className="container mx-auto px-6">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live provider inventory
                </span>
                <h2 id="destination-experiences" className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  Experiences in {destination.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Browse freely. You only need an account when you are ready to book.
                </p>
              </div>
              {experiences.length > 0 && (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'} available
                </span>
              )}
            </div>

            {loadState.loading && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading destination experiences">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="h-72 animate-pulse rounded-[24px] bg-white dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!loadState.loading && experiences.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {experiences.map(experience => (
                  <article key={experience.id} className="flex min-h-72 flex-col rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        {CATEGORY_LABELS[experience.category] || CATEGORY_LABELS.other}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatPrice(experience)}</span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{experience.title}</h3>
                    {experience.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {experience.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-teal-500" />
                        {experience.locationName || destination.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                        {experience.scheduledTime?.slice(0, 5) || 'Flexible time'}
                        {experience.durationMinutes ? ` · ${experience.durationMinutes} min` : ''}
                      </p>
                      <p className="pt-1 text-slate-400 dark:text-slate-500">
                        Hosted by {experience.providerName || 'a SoloWay provider'}
                      </p>
                    </div>

                    <Link
                      to={isAuthenticated ? '/cart' : '/auth'}
                      state={isAuthenticated ? undefined : { from: '/cart' }}
                      onClick={() => rememberBooking(experience)}
                      className="group mt-auto flex items-center justify-between border-t border-slate-200 pt-5 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white"
                    >
                      {isAuthenticated ? 'Book experience' : 'Create account to book'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {!loadState.loading && experiences.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-950">
                <Compass className="mx-auto h-8 w-8 text-teal-500" />
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                  {loadState.error ? 'Experiences are taking a short detour.' : 'No bookable experiences are live here yet.'}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  {loadState.error || `You can still explore ${destination.name} today. Check back as local SoloWay providers publish new experiences.`}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white px-6 py-20 text-center dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Ready when you are</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold text-slate-900 dark:text-white">
            Turn {destination.name} into your trip.
          </h2>
          <Link
            to={isAuthenticated ? '/start' : '/auth'}
            state={isAuthenticated ? undefined : { from: '/start' }}
            onClick={rememberDestination}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {isAuthenticated ? 'Start planning' : 'Create a free account'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
