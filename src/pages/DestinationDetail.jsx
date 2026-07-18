import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  ExternalLink,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import DestinationScene from '../components/DestinationScene';
import ExperienceLocationMap from '../components/ExperienceLocationMap';
import { getLiveDestination } from '../utils/liveDestinations';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { listExperiences } from '../utils/experienceService';
import { listDestinationEvents } from '../utils/eventsService';
import {
  getSuggestedExperiences,
  groupSuggestionsByTimeSlot,
} from '../utils/suggestedExperiences';
import { resolveExperienceLocation } from '../utils/experienceLocation';

const DAY_MOMENTS = [
  { label: 'Morning', icon: Sunrise },
  { label: 'Afternoon', icon: Sun },
  { label: 'Evening', icon: Moon },
];

const SLOT_ICONS = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

function formatSuggestionPrice(suggestion) {
  return suggestion.priceCents === 0 ? 'Free' : `$${Math.round(suggestion.priceCents / 100)}`;
}

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
  const destination = getLiveDestination(destinationSlug);
  const { isAuthenticated } = useAuth();
  const { setDestination, addToCart } = useTrip();
  const [experiences, setExperiences] = useState([]);
  const [loadState, setLoadState] = useState({ loading: true, error: '' });
  const [liveEvents, setLiveEvents] = useState([]);
  const [hoveredExperienceId, setHoveredExperienceId] = useState(null);
  const [visibleExperienceId, setVisibleExperienceId] = useState(null);
  const experienceCardRefs = useRef(new Map());

  useEffect(() => {
    if (!destination) return undefined;
    let active = true;

    // Optional section: [] (no API key / no coverage / error) hides it entirely.
    listDestinationEvents(destination.id, { limit: 6 })
      .then(response => {
        if (active) setLiveEvents(response?.data?.events || []);
      })
      .catch(() => {
        if (active) setLiveEvents([]);
      });

    return () => {
      active = false;
    };
  }, [destination]);

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

  // Higher-res crop of the same curated Unsplash photo used on the card.
  const heroImage = destination?.image?.replace('w=1200', 'w=2000');

  // Curated solo-friendly fallback shown while no provider inventory is live.
  const suggestionGroups = groupSuggestionsByTimeSlot(
    destination ? getSuggestedExperiences(destination.id) : []
  );

  const experienceCards = useMemo(() => {
    if (experiences.length > 0) {
      return experiences.map(experience => ({ id: experience.id, item: experience }));
    }

    return suggestionGroups.flatMap(group =>
      group.items.map(item => ({ id: item.id, item }))
    );
  }, [experiences, suggestionGroups]);

  const registerExperienceCard = useCallback((id, node) => {
    if (node) experienceCardRefs.current.set(id, node);
    else experienceCardRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (experienceCards.length === 0) {
      setVisibleExperienceId(null);
      return undefined;
    }

    setVisibleExperienceId(previous => previous ?? experienceCards[0].id);

    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.dataset?.experienceId) {
          setVisibleExperienceId(visibleEntries[0].target.dataset.experienceId);
        }
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: '-8% 0px -40% 0px' }
    );

    const frame = window.requestAnimationFrame(() => {
      experienceCardRefs.current.forEach(node => observer.observe(node));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [experienceCards]);

  const activeExperienceId =
    hoveredExperienceId ?? visibleExperienceId ?? experienceCards[0]?.id ?? null;

  const activeExperienceLocation = useMemo(() => {
    if (!destination) return null;

    const activeCard = experienceCards.find(card => card.id === activeExperienceId);
    if (activeCard) return resolveExperienceLocation(activeCard.item, destination);

    return resolveExperienceLocation(
      { title: destination.name, locationName: destination.name },
      destination
    );
  }, [activeExperienceId, destination, experienceCards]);

  const getExperienceCardProps = id => ({
    'data-experience-id': id,
    ref: node => registerExperienceCard(id, node),
    onMouseEnter: () => setHoveredExperienceId(id),
    onMouseLeave: () => setHoveredExperienceId(null),
    onFocus: () => setHoveredExperienceId(id),
    onBlur: () => setHoveredExperienceId(null),
    tabIndex: 0,
  });

  const isActiveExperienceCard = id => activeExperienceId === id;

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
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: destination.imagePosition }}
          />
          <div className="absolute inset-0 bg-slate-950/35 transition-colors duration-300 dark:bg-slate-950/60" />
          <DestinationScene scene={destination.scene} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-slate-950/70 transition-colors duration-300 dark:from-slate-950/45 dark:via-slate-950/10 dark:to-slate-950/85" />
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
                {destination.sceneCaption && (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                    {destination.sceneCaption}
                  </span>
                )}
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

        <section
          className="relative overflow-hidden py-20"
          style={{ backgroundImage: destination.gradient }}
        >
          {/* Blurred nature backdrop from the same destination photo */}
          <img
            src={destination.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
            style={{ objectPosition: destination.imagePosition }}
          />
          <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/70" />
          <DestinationScene scene={destination.scene} className="opacity-60" />

          <div className="container relative mx-auto px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">Start exploring</span>
                <h2 className="mt-3 text-3xl font-semibold text-white">A good day in {destination.name}</h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
                  Build your own day around local culture, social experiences, and the places that make this destination memorable.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {destination.highlights.map((highlight, index) => {
                  const moment = DAY_MOMENTS[index % DAY_MOMENTS.length];
                  const MomentIcon = moment.icon;
                  return (
                    <div
                      key={highlight}
                      className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-colors hover:bg-white/15"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                          <MomentIcon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                          {moment.label}
                        </span>
                      </div>
                      <p className="mt-4 font-semibold text-white">{highlight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 dark:bg-slate-900" aria-labelledby="destination-experiences">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_min(100%,320px)] xl:items-start">
              <div>
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

                {!loadState.loading && experienceCards.length > 0 && (
                  <div className="mb-8 xl:hidden">
                    <ExperienceLocationMap location={activeExperienceLocation} />
                    <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                      Tap or scroll cards to update the map
                    </p>
                  </div>
                )}

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
                  <article
                    key={experience.id}
                    {...getExperienceCardProps(experience.id)}
                    className={`flex min-h-72 flex-col rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-200 dark:bg-slate-950 ${
                      isActiveExperienceCard(experience.id)
                        ? 'border-teal-400/70 ring-2 ring-teal-500/20 dark:border-teal-700'
                        : 'border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
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

            {!loadState.loading && experiences.length === 0 && suggestionGroups.length > 0 && (
              <div className="space-y-10">
                <div className="flex flex-col gap-1.5 rounded-2xl border border-teal-200/70 bg-teal-50/70 px-5 py-4 dark:border-teal-900 dark:bg-teal-950/40">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                    In {destination.name} for work or a few solo days?
                  </p>
                  <p className="text-sm text-teal-800/80 dark:text-teal-300/80">
                    These are our curated solo-friendly picks while local providers finish onboarding —
                    in-app booking opens here soon.
                  </p>
                </div>

                {suggestionGroups.map(group => {
                  const SlotIcon = SLOT_ICONS[group.id] || Sun;
                  return (
                    <div key={group.id}>
                      <div className="mb-4 flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                          <SlotIcon className="h-4 w-4" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{group.label}</h3>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {group.items.map(suggestion => (
                          <article
                            key={suggestion.id}
                            {...getExperienceCardProps(suggestion.id)}
                            className={`flex flex-col rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-200 dark:bg-slate-950 ${
                              isActiveExperienceCard(suggestion.id)
                                ? 'border-teal-400/70 ring-2 ring-teal-500/20 dark:border-teal-700'
                                : 'border-slate-200/80 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                                {suggestion.soloTag}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {formatSuggestionPrice(suggestion)}
                              </span>
                            </div>

                            <h4 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {suggestion.soloNote}
                            </p>

                            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                                {suggestion.displayTime}
                              </span>
                              <span>
                                ★ {suggestion.rating} ({suggestion.reviews})
                              </span>
                            </div>

                            <Link
                              to={isAuthenticated ? '/start' : '/auth'}
                              state={isAuthenticated ? undefined : { from: '/start' }}
                              onClick={rememberDestination}
                              className="group mt-auto flex items-center justify-between border-t border-slate-200 pt-5 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white"
                            >
                              <span className="flex items-center gap-2">
                                Plan this into a trip
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                  Curated idea
                                </span>
                              </span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadState.loading && experiences.length === 0 && suggestionGroups.length === 0 && (
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

              {!loadState.loading && experienceCards.length > 0 && (
                <aside className="hidden xl:block">
                  <div className="sticky top-24">
                    <ExperienceLocationMap location={activeExperienceLocation} />
                    <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
                      Hover or scroll cards to update the map
                    </p>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>

        {liveEvents.length > 0 && (
          <section className="bg-white py-20 dark:bg-slate-950" aria-labelledby="destination-events">
            <div className="container mx-auto px-6">
              <div className="mb-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  On while you&rsquo;re there
                </span>
                <h2 id="destination-events" className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  Happening in {destination.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Concerts and shows are some of the easiest plans to make alone — plenty of people go solo.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {liveEvents.map(event => (
                  <a
                    key={event.id}
                    href={event.url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div
                      className="relative h-36 overflow-hidden bg-slate-200 dark:bg-slate-800"
                      style={destination.gradient ? { backgroundImage: destination.gradient } : undefined}
                    >
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                        {event.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{event.name}</h3>
                      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {event.date && (
                          <p className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-teal-500" />
                            {new Date(`${event.date}T00:00`).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {event.time ? ` · ${event.time.slice(0, 5)}` : ''}
                          </p>
                        )}
                        {event.venue && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-sky-500" />
                            {event.venue}
                          </p>
                        )}
                      </div>
                      <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold text-slate-400 transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        View event
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

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
