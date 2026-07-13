const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The homepage destination rotation flips once per day at midnight US
 * Eastern (America/New_York), for every visitor worldwide. Using an IANA
 * zone rather than a fixed UTC offset keeps the flip at 12am through
 * daylight-saving changes.
 */
export const ROTATION_TIME_ZONE = 'America/New_York';

const zonedPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: ROTATION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getEasternParts(date) {
  const parts = {};
  for (const { type, value } of zonedPartsFormatter.formatToParts(date)) {
    parts[type] = value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getEasternMillisecondsIntoDay(date) {
  const { hour, minute, second } = getEasternParts(date);
  return (
    ((hour * 60 + minute) * 60 + second) * 1000 + date.getMilliseconds()
  );
}

export function getRotationDayNumber(date = new Date()) {
  const { year, month, day } = getEasternParts(date);
  return Math.floor(Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY);
}

export function rotateForDate(items, date = new Date()) {
  if (!items.length) return [];

  const offset = getRotationDayNumber(date) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function millisecondsUntilNextRotation(date = new Date()) {
  let remaining = MILLISECONDS_PER_DAY - getEasternMillisecondsIntoDay(date);

  // On the spring-forward DST day the Eastern day is only 23 hours long, so
  // the naive remainder lands one hour past midnight. One correction pass
  // pulls it back. (On fall-back days the timer fires an hour early instead,
  // and the caller's reschedule loop covers the final hour.)
  const candidate = new Date(date.getTime() + remaining);
  const overshoot = getEasternMillisecondsIntoDay(candidate);
  if (overshoot > 0 && overshoot < MILLISECONDS_PER_DAY / 2) {
    remaining -= overshoot;
  }

  return Math.max(1, remaining);
}
