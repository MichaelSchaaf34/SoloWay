import { useEffect, useMemo, useState } from 'react';
import { DESTINATIONS } from '../components/Destinations';
import { getActivitiesForDestination } from '../data/activityCatalog';
import { rotateForDate } from '../utils/destinationRotation';
import { listExperiences } from '../utils/experienceService';
import { toSuggestedExperience } from '../utils/suggestedExperiences';

const CHILL_CATEGORIES = new Set(['relax', 'wellness', 'food', 'culture']);
const ADVENTURE_CATEGORIES = new Set(['activity', 'outdoors', 'tours', 'nightlife', 'other']);

const CHILL_CATALOG_CATS = new Set(['food', 'culture', 'wellness']);
const ADVENTURE_CATALOG_CATS = new Set(['outdoors', 'tours', 'nightlife']);

function categoryToType(category) {
  if (category === 'food') return 'food';
  if (CHILL_CATEGORIES.has(category)) return 'relax';
  return 'active';
}

function matchesMood(item, mood) {
  if (item.catalogCat) {
    if (mood === 'chill') return CHILL_CATALOG_CATS.has(item.catalogCat);
    return ADVENTURE_CATALOG_CATS.has(item.catalogCat);
  }

  if (mood === 'chill') return CHILL_CATEGORIES.has(item.category);
  return ADVENTURE_CATEGORIES.has(item.category);
}

function normalizeLiveExperience(experience) {
  const time = experience.scheduledTime
    ? formatScheduledTime(experience.scheduledTime)
    : 'Flexible';

  return {
    id: experience.id,
    title: experience.title,
    category: experience.category || 'other',
    priceCents: experience.priceCents ?? 0,
    currency: experience.currency || 'usd',
    time,
    type: categoryToType(experience.category || 'other'),
    isSuggestion: false,
  };
}

function normalizeCuratedActivity(activity, destinationSlug) {
  const suggestion = toSuggestedExperience(activity, destinationSlug);

  return {
    ...suggestion,
    time: suggestion.displayTime || 'Flexible',
    type: categoryToType(suggestion.category),
    catalogCat: activity.cat,
    isSuggestion: true,
  };
}

function formatScheduledTime(value) {
  const match = /^(\d{2}):(\d{2})/.exec(value || '');
  if (!match) return 'Flexible';

  let hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

function pickExperiences(pool, mood, limit = 3) {
  const filtered = pool.filter(item => matchesMood(item, mood));
  const source = filtered.length >= limit ? filtered : pool;
  return source.slice(0, limit);
}

export function formatDiscoveryPrice(priceCents, currency = 'usd') {
  if (!priceCents) return 'Free';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(priceCents / 100);
  } catch {
    return `$${Math.round(priceCents / 100)}`;
  }
}

export default function useHeroDiscovery(rotationDate = new Date()) {
  const [mood, setMood] = useState('chill');
  const [liveExperiences, setLiveExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const destination = useMemo(
    () => rotateForDate(DESTINATIONS, rotationDate)[0],
    [rotationDate]
  );

  useEffect(() => {
    let active = true;

    listExperiences({ limit: 100 })
      .then(response => {
        if (!active) return;
        setLiveExperiences(response?.data?.experiences || response?.experiences || []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLiveExperiences([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const destinationExperiences = useMemo(() => {
    if (!destination) return { items: [], isLive: false };

    const liveForDestination = liveExperiences
      .filter(experience => experience.destinationSlug === destination.id)
      .map(normalizeLiveExperience);

    if (liveForDestination.length > 0) {
      return { items: liveForDestination, isLive: true };
    }

    const curated = getActivitiesForDestination(destination.id).map(activity =>
      normalizeCuratedActivity(activity, destination.id)
    );

    return { items: curated, isLive: false };
  }, [destination, liveExperiences]);

  const experiences = useMemo(
    () => pickExperiences(destinationExperiences.items, mood),
    [destinationExperiences.items, mood]
  );

  return {
    destination,
    experiences,
    mood,
    setMood,
    loading,
    isLive: destinationExperiences.isLive,
  };
}
