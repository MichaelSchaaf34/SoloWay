import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createItinerary, getMyItineraries } from '../utils/itineraryService';
import { CityAutocomplete, ImmersivePage } from '../components';
import { US_STATE_OPTIONS } from '../utils/usStates';
import { formatDestination } from '../utils/destination';
import {
  applySelection,
  getCitySuggestions,
  getCountryOptions,
  getRegionOptions,
} from '../utils/destinationSelector';

const defaultForm = {
  title: '',
  destinationCountry: '',
  destinationCity: '',
  destinationRegion: '',
  startDate: '',
  endDate: '',
  mood: 'balanced',
  isPublic: false,
};

const Itineraries = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getMyItineraries({ limit: 30 });
        const data = response?.data || response;
        if (mounted) setItineraries(data?.itineraries || []);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load itineraries');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const regionOptions = useMemo(
    () => getRegionOptions(form.destinationCountry),
    [form.destinationCountry]
  );
  const citySuggestions = useMemo(
    () => getCitySuggestions(form.destinationCountry, form.destinationRegion),
    [form.destinationCountry, form.destinationRegion]
  );

  const commitSelection = (type, value) => {
    const resolved = applySelection(type, value, {
      country: form.destinationCountry,
      region: form.destinationRegion,
      city: form.destinationCity,
    });
    setForm(prev => ({
      ...prev,
      destinationCountry: resolved.country,
      destinationRegion: resolved.region,
      destinationCity: resolved.city,
    }));
  };

  const updateCity = value => {
    setForm(prev => ({ ...prev, destinationCity: value }));
    const resolved = applySelection('city', value, {
      country: form.destinationCountry,
      region: form.destinationRegion,
      city: form.destinationCity,
    });
    if (resolved.city !== value || resolved.country || resolved.region) {
      setForm(prev => ({
        ...prev,
        destinationCountry: resolved.country,
        destinationRegion: resolved.region,
        destinationCity: resolved.city,
      }));
    }
  };

  const handleCreate = async event => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!form.destinationCountry || !form.destinationCity) {
        setError('Please provide country and city for destination.');
        return;
      }
      if (form.destinationCountry === 'United States' && !form.destinationRegion) {
        setError('Please select a state for United States trips.');
        return;
      }

      const payload = {
        ...form,
        destination: formatDestination({
          country: form.destinationCountry,
          region: form.destinationRegion,
          city: form.destinationCity,
        }),
      };
      const response = await createItinerary(payload);
      const data = response?.data || response;
      const itinerary = data?.itinerary || data;
      if (itinerary?.id) navigate(`/itineraries/${itinerary.id}`);
    } catch (e) {
      setError(e.message || 'Could not create itinerary');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-16"
    >
      <section className="max-w-6xl mx-auto">
        <Link to="/start" className="text-teal-700 text-sm hover:text-teal-800">← Back to first choices</Link>
        <h1 className="text-4xl font-bold mt-3">My Itineraries</h1>
        {error && <p className="mt-6 rounded-xl border border-rose-300 bg-rose-50/90 px-4 py-3 text-rose-700">{error}</p>}

        <section className="mt-8 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Create a new trip</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <input type="text" placeholder="Trip title" required value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <select required value={form.destinationCountry} onChange={e => commitSelection('country', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="" disabled>Select destination country</option>
              {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
            </select>

            <CityAutocomplete
              placeholder="City (type to search)"
              required
              value={form.destinationCity}
              suggestions={citySuggestions}
              onChange={updateCity}
            />

            {form.destinationCountry === 'United States' ? (
              <select required value={form.destinationRegion} onChange={e => commitSelection('region', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
                <option value="" disabled>Select state</option>
                {US_STATE_OPTIONS.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            ) : (
              <select value={form.destinationRegion} onChange={e => commitSelection('region', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
                <option value="" disabled>Select region/state</option>
                {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            )}

            <input type="date" required value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <input type="date" required value={form.endDate} min={form.startDate || undefined} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <select value={form.mood} onChange={e => setForm(prev => ({ ...prev, mood: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="balanced">Balanced</option>
              <option value="chill">Chill</option>
              <option value="adventure">Adventure</option>
            </select>
            <label className="flex items-center gap-3 text-sm text-slate-700 px-1">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm(prev => ({ ...prev, isPublic: e.target.checked }))} className="h-4 w-4" />
              Make itinerary public
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 font-semibold disabled:opacity-70">
                {isSubmitting ? 'Creating...' : 'Create itinerary'}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Saved trips</h2>
          {isLoading ? (
            <p className="text-slate-600 mt-4">Loading trips...</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {itineraries.map(itinerary => (
                <Link key={itinerary.id} to={`/itineraries/${itinerary.id}`} className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm hover:border-teal-500/60">
                  <h3 className="font-semibold text-lg">{itinerary.title}</h3>
                  <p className="text-slate-600 mt-2">{itinerary.destination}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </ImmersivePage>
  );
};

export default Itineraries;
