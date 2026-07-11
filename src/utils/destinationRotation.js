const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getLocalDayNumber(date = new Date()) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY
  );
}

export function rotateForDate(items, date = new Date()) {
  if (!items.length) return [];

  const offset = getLocalDayNumber(date) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function millisecondsUntilNextLocalDay(date = new Date()) {
  const nextDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );
  return Math.max(1, nextDay.getTime() - date.getTime());
}
