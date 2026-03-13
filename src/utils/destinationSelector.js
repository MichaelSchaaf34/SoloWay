import { DESTINATION_CATALOG } from './destinationCatalog';

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function getCountryOptions() {
  return uniq(DESTINATION_CATALOG.map(entry => entry.country));
}

export function getRegionOptions(country) {
  const scoped = country
    ? DESTINATION_CATALOG.filter(entry => entry.country === country)
    : DESTINATION_CATALOG;
  return uniq(scoped.map(entry => entry.region));
}

export function getCitySuggestions(country, region) {
  let scoped = DESTINATION_CATALOG;
  if (country) scoped = scoped.filter(entry => entry.country === country);
  if (region) scoped = scoped.filter(entry => entry.region === region);
  return uniq(scoped.map(entry => entry.city));
}

function equalsCI(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

export function applySelection(type, value, current) {
  const next = {
    country: current.country || '',
    region: current.region || '',
    city: current.city || '',
  };

  if (type === 'country') {
    const candidate = DESTINATION_CATALOG.find(entry => entry.country === value);
    return candidate
      ? { country: candidate.country, region: candidate.region, city: candidate.city }
      : { ...next, country: value };
  }

  if (type === 'region') {
    const byCountry = current.country
      ? DESTINATION_CATALOG.find(entry => entry.country === current.country && entry.region === value)
      : null;
    const candidate = byCountry || DESTINATION_CATALOG.find(entry => entry.region === value);
    return candidate
      ? { country: candidate.country, region: candidate.region, city: candidate.city }
      : { ...next, region: value };
  }

  if (type === 'city') {
    const byRegion = current.region
      ? DESTINATION_CATALOG.find(
          entry =>
            equalsCI(entry.city, value) &&
            (!current.country || entry.country === current.country) &&
            entry.region === current.region
        )
      : null;
    const byCountry = current.country
      ? DESTINATION_CATALOG.find(entry => equalsCI(entry.city, value) && entry.country === current.country)
      : null;
    const candidate = byRegion || byCountry || DESTINATION_CATALOG.find(entry => equalsCI(entry.city, value));
    if (candidate) {
      return { country: candidate.country, region: candidate.region, city: candidate.city };
    }
    return { ...next, city: value };
  }

  return next;
}
