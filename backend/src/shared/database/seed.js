/**
 * Development seed: one demo provider with bookable experiences per
 * destination, so the live-inventory path (destination pages, explore,
 * checkout) can be exercised locally without real Stripe onboarding.
 *
 * Run with: npm run db:seed (from backend/). Refuses to run in production.
 * Idempotent: re-running replaces the demo provider's experiences.
 */

import 'dotenv/config';
import { getSupabaseAdmin } from './supabase.js';

const DEMO_EMAIL = 'demo-provider@soloway.dev';
const DEMO_DISPLAY_NAME = 'SoloWay Demo Provider';

const SEED_EXPERIENCES = [
  // Reykjavík
  { destination_slug: 'reykjavik', title: 'Northern Lights Small-Group Hunt', category: 'activity', location_name: 'Reykjavík harbor pickup', scheduled_time: '21:00', timezone: 'Atlantic/Reykjavik', duration_minutes: 240, price_cents: 6500, description: 'Guided night tour chasing the aurora — solo travelers make up most of the van.' },
  { destination_slug: 'reykjavik', title: 'Sky Lagoon Geothermal Evening', category: 'relax', location_name: 'Kársnes, Kópavogur', scheduled_time: '18:00', timezone: 'Atlantic/Reykjavik', duration_minutes: 150, price_cents: 7500, description: 'Soak solo in the sea-edge lagoon after a workday. Towel and ritual pass included.' },
  { destination_slug: 'reykjavik', title: 'Icelandic Food Walk Downtown', category: 'food', location_name: 'Hallgrímskirkja steps', scheduled_time: '12:00', timezone: 'Atlantic/Reykjavik', duration_minutes: 180, price_cents: 9900, description: 'Lamb soup, skyr, and hot dogs with a local guide and a small group.' },
  // Lisbon
  { destination_slug: 'lisbon', title: 'Alfama Fado & Tapas Evening', category: 'nightlife', location_name: 'Largo do Chafariz de Dentro', scheduled_time: '20:00', timezone: 'Europe/Lisbon', duration_minutes: 180, price_cents: 4500, description: 'Shared-table fado house — a natural solo night out.' },
  { destination_slug: 'lisbon', title: 'Pastel de Nata Baking Class', category: 'food', location_name: 'Baixa workshop kitchen', scheduled_time: '10:30', timezone: 'Europe/Lisbon', duration_minutes: 120, price_cents: 3900, description: 'Everyone bakes their own tray — easy to join alone.' },
  { destination_slug: 'lisbon', title: 'Sunset Miradouro Photo Walk', category: 'activity', location_name: 'Miradouro da Graça', scheduled_time: '18:30', timezone: 'Europe/Lisbon', duration_minutes: 120, price_cents: 2500, description: 'Golden-hour walk between viewpoints with a photographer guide.' },
  // Kyoto
  { destination_slug: 'kyoto', title: 'Morning Tea Ceremony for Solo Guests', category: 'culture', location_name: 'Gion machiya house', scheduled_time: '09:00', timezone: 'Asia/Tokyo', duration_minutes: 90, price_cents: 3500, description: 'Individual seats, quiet pace — hosts are used to guests arriving alone.' },
  { destination_slug: 'kyoto', title: 'Nishiki Market Tasting Walk', category: 'food', location_name: 'Nishiki Market east gate', scheduled_time: '11:00', timezone: 'Asia/Tokyo', duration_minutes: 150, price_cents: 4500, description: 'Graze the market stalls with a small group and a local guide.' },
  { destination_slug: 'kyoto', title: 'Evening Gion Lantern Walk', category: 'activity', location_name: 'Yasaka Shrine entrance', scheduled_time: '19:00', timezone: 'Asia/Tokyo', duration_minutes: 120, price_cents: 2800, description: 'Guided stroll through the geisha district after work hours.' },
  // Cape Town
  { destination_slug: 'cape-town', title: 'Table Mountain Guided Sunrise Hike', category: 'activity', location_name: 'Platteklip Gorge trailhead', scheduled_time: '06:00', timezone: 'Africa/Johannesburg', duration_minutes: 240, price_cents: 4000, description: 'Never hike it alone — join a guided morning group.' },
  { destination_slug: 'cape-town', title: 'Bo-Kaap Cooking Experience', category: 'food', location_name: 'Wale Street, Bo-Kaap', scheduled_time: '12:00', timezone: 'Africa/Johannesburg', duration_minutes: 180, price_cents: 4800, description: 'Cook Cape Malay curry in a family home with other travelers.' },
  { destination_slug: 'cape-town', title: 'V&A Waterfront Evening Food Market', category: 'nightlife', location_name: 'V&A Waterfront', scheduled_time: '18:00', timezone: 'Africa/Johannesburg', duration_minutes: 120, price_cents: 3000, description: 'Hosted market crawl on the safest, liveliest promenade in town.' },
  // Barcelona
  { destination_slug: 'barcelona', title: 'Tapas Crawl for Solo Travelers', category: 'food', location_name: 'El Born meeting point', scheduled_time: '19:30', timezone: 'Europe/Madrid', duration_minutes: 180, price_cents: 5500, description: 'Shared tables at every stop — designed for people who arrive alone.' },
  { destination_slug: 'barcelona', title: 'Gothic Quarter Story Walk', category: 'culture', location_name: 'Plaça Nova', scheduled_time: '11:00', timezone: 'Europe/Madrid', duration_minutes: 120, price_cents: 1500, description: 'Small-group history walk through the old city.' },
  { destination_slug: 'barcelona', title: 'Sunset Sail on the Mediterranean', category: 'activity', location_name: 'Port Olímpic', scheduled_time: '18:30', timezone: 'Europe/Madrid', duration_minutes: 120, price_cents: 6900, description: 'Shared catamaran with drinks — an easy after-work plan.' },
  // Medellín
  { destination_slug: 'medellin', title: 'Comuna 13 Art & History Tour', category: 'culture', location_name: 'San Javier metro station', scheduled_time: '10:00', timezone: 'America/Bogota', duration_minutes: 180, price_cents: 2200, description: 'Backpacker-favorite group tour — most people join alone.' },
  { destination_slug: 'medellin', title: 'Salsa Class in El Poblado', category: 'nightlife', location_name: 'Parque Lleras studio', scheduled_time: '19:00', timezone: 'America/Bogota', duration_minutes: 90, price_cents: 2000, description: 'Partners rotate — coming alone is expected.' },
  { destination_slug: 'medellin', title: 'Coffee Farm Half-Day Trip', category: 'food', location_name: 'El Poblado pickup', scheduled_time: '07:30', timezone: 'America/Bogota', duration_minutes: 300, price_cents: 5500, description: 'Shared van into coffee country with tastings at the finca.' },
];

async function upsertDemoUser(supabase) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', DEMO_EMAIL)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('users')
    .insert({ email: DEMO_EMAIL, display_name: DEMO_DISPLAY_NAME })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create demo user: ${error.message}`);
  return data.id;
}

async function upsertDemoProvider(supabase, userId) {
  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('providers')
    .insert({
      user_id: userId,
      display_name: DEMO_DISPLAY_NAME,
      onboarding_status: 'active',
      charges_enabled: true,
      payouts_enabled: true,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create demo provider: ${error.message}`);
  return data.id;
}

async function replaceDemoExperiences(supabase, providerId) {
  const { error: deleteError } = await supabase
    .from('experiences')
    .delete()
    .eq('provider_id', providerId);
  if (deleteError) throw new Error(`Failed to clear demo experiences: ${deleteError.message}`);

  const rows = SEED_EXPERIENCES.map(experience => ({
    ...experience,
    provider_id: providerId,
    currency: 'usd',
    is_active: true,
  }));

  const { error: insertError } = await supabase.from('experiences').insert(rows);
  if (insertError) throw new Error(`Failed to insert demo experiences: ${insertError.message}`);
  return rows.length;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed demo data in production.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  const userId = await upsertDemoUser(supabase);
  const providerId = await upsertDemoProvider(supabase, userId);
  const count = await replaceDemoExperiences(supabase, providerId);

  console.log(`Seeded ${count} demo experiences for provider ${DEMO_DISPLAY_NAME} (${providerId}).`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
