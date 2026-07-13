import { getActivitiesForDestination } from '../data/activityCatalog';

/**
 * Adapts curated activityCatalog entries into "suggested experience" cards
 * shown when a destination has no live provider inventory yet. Suggestions
 * are preview-only: they carry no `providerId`, so `TripContext` blocks them
 * from checkout — they exist to help a solo traveler plan, not to transact.
 */

// activityCatalog categories → live experience categories (backend enum)
const CATEGORY_MAP = {
  food: 'food',
  culture: 'culture',
  nightlife: 'nightlife',
  tours: 'activity',
  outdoors: 'activity',
  wellness: 'relax',
};

// Fallback solo framing for catalog entries without explicit soloTag/soloNote.
const DEFAULT_SOLO_BY_CATEGORY = {
  food: { soloTag: 'Easy alone', soloNote: 'Food experiences seat solo guests without a second thought.' },
  culture: { soloTag: 'Easy alone', soloNote: 'Go at your own pace — culture is best unhurried.' },
  nightlife: { soloTag: 'Meet people', soloNote: 'Organized nights out are built for people who arrive alone.' },
  tours: { soloTag: 'Small group', soloNote: 'Guided groups are the easiest way to explore solo.' },
  outdoors: { soloTag: 'Easy alone', soloNote: 'Popular routes with steady foot traffic — comfortable on your own.' },
  wellness: { soloTag: 'Easy alone', soloNote: 'Wellness time is naturally a party of one.' },
};

export const TIME_SLOTS = [
  { id: 'morning', label: 'Free morning' },
  { id: 'afternoon', label: 'Free afternoon' },
  { id: 'evening', label: 'Evening after work' },
];

export function getTimeSlot(time) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time || '');
  if (!match) return 'morning';

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function toSuggestedExperience(activity, destinationSlug) {
  const solo = DEFAULT_SOLO_BY_CATEGORY[activity.cat] || DEFAULT_SOLO_BY_CATEGORY.tours;

  return {
    id: `suggested-${activity.id}`,
    destinationSlug,
    title: activity.name,
    category: CATEGORY_MAP[activity.cat] || 'other',
    priceCents: Math.round((activity.price || 0) * 100),
    currency: 'usd',
    displayTime: activity.time,
    timeSlot: getTimeSlot(activity.time),
    rating: activity.rating,
    reviews: activity.reviews,
    soloTag: activity.soloTag || solo.soloTag,
    soloNote: activity.soloNote || solo.soloNote,
    isSuggestion: true,
  };
}

export function getSuggestedExperiences(destinationSlug, { category } = {}) {
  if (!destinationSlug) return [];

  const suggestions = getActivitiesForDestination(destinationSlug).map(activity =>
    toSuggestedExperience(activity, destinationSlug)
  );

  return category
    ? suggestions.filter(suggestion => suggestion.category === category)
    : suggestions;
}

/** Groups suggestions into the free-time slots a solo/work traveler plans around. */
export function groupSuggestionsByTimeSlot(suggestions) {
  return TIME_SLOTS.map(slot => ({
    ...slot,
    items: suggestions.filter(suggestion => suggestion.timeSlot === slot.id),
  })).filter(group => group.items.length > 0);
}
