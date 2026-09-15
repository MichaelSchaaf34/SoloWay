/**
 * Ticketmaster coverage probe.
 *
 * Answers one question: for each destination SoloWay ships, would a traveler
 * actually see events on the destination page — right now, and inside a
 * realistic trip window?
 *
 * It calls `fetchTicketmasterEvents` directly, which is the same request the
 * events API sends, minus the Redis cache. So the counts here are what users
 * would see, not an approximation.
 *
 *   node scripts/probe-events.js            # human-readable report
 *   node scripts/probe-events.js --json     # machine-readable, for CI
 *
 * Exits non-zero only for configuration faults (missing or rejected key), not
 * for thin coverage — an empty city is a finding, not a broken script.
 */

import 'dotenv/config';
import { config } from '../src/config/index.js';
import {
  DESTINATION_EVENT_AREAS,
  fetchTicketmasterEvents,
} from '../src/modules/events/events.service.js';

const JSON_OUTPUT = process.argv.includes('--json');

// Ticketmaster allows 5 requests/second. Stay under it.
const REQUEST_SPACING_MS = 250;

// The destination page asks for 6; probe higher to see whether a city is
// merely thin or genuinely rich.
const PROBE_LIMIT = 20;

const WINDOWS = [
  { key: 'anytime', label: 'anytime', days: null },
  { key: 'next7', label: 'next 7d', days: 7 },
  { key: 'next30', label: 'next 30d', days: 30 },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function windowEnd(days) {
  if (!days) return undefined;
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + days);
  return end;
}

async function probeWindow(area, days) {
  try {
    const events = await fetchTicketmasterEvents(area, PROBE_LIMIT, {
      endDate: windowEnd(days),
    });
    return { count: events.length, sample: events[0]?.name || null, error: null };
  } catch (error) {
    // The message carries the HTTP status, e.g. "Ticketmaster responded with 401".
    return { count: null, sample: null, error: error.message };
  }
}

async function probeDestination(slug) {
  const area = DESTINATION_EVENT_AREAS[slug];
  const windows = {};

  for (const { key, days } of WINDOWS) {
    windows[key] = await probeWindow(area, days);
    await sleep(REQUEST_SPACING_MS);
  }

  return { slug, label: area.label, windows };
}

function classify(result) {
  const { anytime, next7, next30 } = result.windows;
  if (anytime.error) return 'error';
  if (anytime.count === 0) return 'no-inventory';
  if (next30.count === 0) return 'nothing-soon';
  if (next7.count === 0) return 'thin-this-week';
  return 'healthy';
}

const VERDICTS = {
  healthy: 'events this week',
  'thin-this-week': 'none this week, some within 30d',
  'nothing-soon': 'listings exist but none within 30d',
  'no-inventory': 'NO COVERAGE — page will hide the section',
  error: 'REQUEST FAILED',
};

function cell(probe) {
  if (probe.error) return 'err';
  return probe.count === PROBE_LIMIT ? `${PROBE_LIMIT}+` : String(probe.count);
}

function printReport(results) {
  const pad = (value, width) => String(value).padEnd(width);
  const slugWidth = Math.max(...results.map(r => r.slug.length), 11);

  console.log(`\nTicketmaster coverage — ${new Date().toISOString().slice(0, 16)}Z`);
  console.log(`Probed ${results.length} destinations at limit ${PROBE_LIMIT}\n`);
  console.log(
    `${pad('destination', slugWidth)}  ${pad('anytime', 8)}${pad('7d', 5)}${pad('30d', 5)}  verdict`
  );
  console.log('-'.repeat(slugWidth + 60));

  for (const result of results) {
    const { anytime, next7, next30 } = result.windows;
    console.log(
      `${pad(result.slug, slugWidth)}  ${pad(cell(anytime), 8)}${pad(cell(next7), 5)}` +
        `${pad(cell(next30), 5)}  ${VERDICTS[classify(result)]}`
    );
  }

  const buckets = results.reduce((acc, result) => {
    const verdict = classify(result);
    (acc[verdict] ||= []).push(result.slug);
    return acc;
  }, {});

  console.log('\nSummary');
  for (const [verdict, label] of Object.entries(VERDICTS)) {
    const slugs = buckets[verdict];
    if (slugs) console.log(`  ${slugs.length.toString().padStart(2)} ${label}: ${slugs.join(', ')}`);
  }

  const samples = results.filter(r => r.windows.next30.sample).slice(0, 3);
  if (samples.length > 0) {
    console.log('\nSample titles (next 30d)');
    for (const result of samples) {
      console.log(`  ${result.slug}: ${result.windows.next30.sample}`);
    }
  }

  if (buckets.error) {
    console.log(`\nFirst error: ${results.find(r => r.windows.anytime.error).windows.anytime.error}`);
    console.log('  401/403 means the key is wrong or not yet activated.');
    console.log('  429 means the probe outran the rate limit — rerun it.');
  }

  const dark = (buckets['no-inventory'] || []).length + (buckets['nothing-soon'] || []).length;
  if (dark > 0) {
    console.log(
      `\n${dark} of ${results.length} destination pages will show no events section at all.`
    );
  }
}

async function main() {
  if (!config.externalApis.ticketmasterApiKey) {
    console.error('TICKETMASTER_API_KEY is not set, so every destination returns [] today.');
    console.error('Get a free key at https://developer.ticketmaster.com, then add to backend/.env:');
    console.error('  TICKETMASTER_API_KEY=your-consumer-key');
    process.exit(1);
  }

  const slugs = Object.keys(DESTINATION_EVENT_AREAS);
  const results = [];

  for (const slug of slugs) {
    if (!JSON_OUTPUT) process.stdout.write(`probing ${slug}...\r`);
    results.push(await probeDestination(slug));
  }

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          probedAt: new Date().toISOString(),
          limit: PROBE_LIMIT,
          results: results.map(result => ({ ...result, verdict: classify(result) })),
        },
        null,
        2
      )
    );
  } else {
    printReport(results);
  }

  // Only a configuration fault is a script failure. Every window failing is
  // the signature of a rejected key rather than 15 unlucky cities.
  const allFailed = results.every(result => result.windows.anytime.error);
  process.exit(allFailed ? 1 : 0);
}

main().catch(error => {
  console.error('Probe crashed:', error.message);
  process.exit(1);
});
