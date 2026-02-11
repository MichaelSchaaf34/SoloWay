export function formatDestination({ country, city, region }) {
  const parts = [city?.trim(), region?.trim(), country?.trim()].filter(Boolean);
  return parts.join(', ');
}

export function parseDestination(destination = '') {
  const parts = String(destination)
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { destinationCountry: '', destinationRegion: '', destinationCity: '' };
  }
  if (parts.length === 1) {
    return { destinationCountry: '', destinationRegion: '', destinationCity: parts[0] };
  }
  if (parts.length === 2) {
    return { destinationCity: parts[0], destinationRegion: '', destinationCountry: parts[1] };
  }
  return {
    destinationCity: parts[0],
    destinationRegion: parts[1],
    destinationCountry: parts.slice(2).join(', '),
  };
}
