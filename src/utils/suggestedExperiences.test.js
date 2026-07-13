import { describe, expect, it } from 'vitest';
import {
  getSuggestedExperiences,
  getTimeSlot,
  groupSuggestionsByTimeSlot,
} from './suggestedExperiences';

describe('suggested experiences adapter', () => {
  it('maps catalog categories to live experience categories', () => {
    const suggestions = getSuggestedExperiences('reykjavik');
    const byTitle = Object.fromEntries(suggestions.map(s => [s.title, s]));

    expect(byTitle['Golden Circle Day Tour'].category).toBe('activity'); // tours
    expect(byTitle['Northern Lights Hunt'].category).toBe('activity'); // outdoors
    expect(byTitle['Blue Lagoon Spa'].category).toBe('relax'); // wellness
    expect(byTitle['Icelandic Lamb & Craft Beer'].category).toBe('food');
  });

  it('buckets start times into solo free-time slots', () => {
    expect(getTimeSlot('8:00 AM')).toBe('morning');
    expect(getTimeSlot('11:59 AM')).toBe('morning');
    expect(getTimeSlot('12:00 PM')).toBe('afternoon');
    expect(getTimeSlot('4:59 PM')).toBe('afternoon');
    expect(getTimeSlot('5:00 PM')).toBe('evening');
    expect(getTimeSlot('10:00 PM')).toBe('evening');
    expect(getTimeSlot('2:00 AM')).toBe('morning');
  });

  it('keeps curated solo notes and falls back to category defaults', () => {
    const reykjavik = getSuggestedExperiences('reykjavik');
    const curated = reykjavik.find(s => s.title === 'Blue Lagoon Spa');
    expect(curated.soloTag).toBe('Easy alone');
    expect(curated.soloNote).toBe('Soaking solo is completely normal here.');

    // Florence entries have no explicit solo fields — defaults apply.
    const florence = getSuggestedExperiences('florence');
    expect(florence.length).toBeGreaterThan(0);
    for (const suggestion of florence) {
      expect(suggestion.soloTag).toBeTruthy();
      expect(suggestion.soloNote).toBeTruthy();
    }
  });

  it('marks suggestions as previews without provider ids', () => {
    for (const suggestion of getSuggestedExperiences('lisbon')) {
      expect(suggestion.isSuggestion).toBe(true);
      expect(suggestion.providerId).toBeUndefined();
    }
  });

  it('filters by mapped category and handles unknown destinations', () => {
    const food = getSuggestedExperiences('barcelona', { category: 'food' });
    expect(food.length).toBeGreaterThan(0);
    expect(food.every(s => s.category === 'food')).toBe(true);

    expect(getSuggestedExperiences('atlantis')).toEqual([]);
    expect(getSuggestedExperiences(undefined)).toEqual([]);
  });

  it('groups by time slot in morning → afternoon → evening order', () => {
    const groups = groupSuggestionsByTimeSlot(getSuggestedExperiences('kyoto'));
    const ids = groups.map(group => group.id);

    expect(ids).toEqual([...ids].sort((a, b) => {
      const order = ['morning', 'afternoon', 'evening'];
      return order.indexOf(a) - order.indexOf(b);
    }));
    for (const group of groups) {
      expect(group.items.length).toBeGreaterThan(0);
      expect(group.items.every(item => item.timeSlot === group.id)).toBe(true);
    }
  });
});
