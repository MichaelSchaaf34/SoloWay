import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Trash2 } from 'lucide-react';
import { createItinerary, deleteItinerary, getMyItineraries } from '../utils/itineraryService';
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getMyItineraries({ limit: 30 });
        const data = response?.data || response;
        const list = data?.itineraries || [];
        if (mounted) {
          setItineraries(list);
          if (list.length === 0) setShowCreateForm(true);
        }
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

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteItinerary(id);
      setItineraries(prev => prev.filter(it => it.id !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e.message || 'Could not delete itinerary');
      setConfirmDeleteId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

        <div className="flex items-center justify-between mt-3 mb-6">
          <h1 className="text-4xl font-bold text-slate-900">My Itineraries</h1>
          {!isLoading && itineraries.length > 0 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          )}
        </div>

        {error && <p className="mb-6 rounded-xl border border-rose-300 bg-rose-50/90 px-4 py-3 text-rose-700">{error}</p>}

        {/* Create form — collapsible */}
        {showCreateForm && (
          <section className="mb-6 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg backdrop-blur-sm hover:shadow-xl hover:bg-white/90 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {itineraries.length === 0 ? 'Plan your first adventure' : 'Create a new trip'}
                </h2>
                {itineraries.length === 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">Fill in the details below to get started.</p>
                )}
              </div>
              {itineraries.length > 0 && (
                <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
                  Close
                </button>
              )}
            </div>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
              <input type="text" placeholder="Trip title" required value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm" />
              <select required value={form.destinationCountry} onChange={e => commitSelection('country', e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm">
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
                <select required value={form.destinationRegion} onChange={e => commitSelection('region', e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm">
                  <option value="" disabled>Select state</option>
                  {US_STATE_OPTIONS.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              ) : (
                <select value={form.destinationRegion} onChange={e => commitSelection('region', e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm">
                  <option value="" disabled>Select region/state</option>
                  {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
              )}

              <input type="date" required value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm" />
              <input type="date" required value={form.endDate} min={form.startDate || undefined} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm" />
              <select value={form.mood} onChange={e => setForm(prev => ({ ...prev, mood: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-slate-900 text-sm">
                <option value="balanced">Balanced</option>
                <option value="chill">Chill</option>
                <option value="adventure">Adventure</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-slate-600 px-1">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(prev => ({ ...prev, isPublic: e.target.checked }))} className="h-3.5 w-3.5" />
                Make itinerary public
              </label>
              <div className="md:col-span-2">
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-sm font-semibold disabled:opacity-70">
                  {isSubmitting ? 'Creating...' : 'Create itinerary'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Saved trips — primary content */}
        <section>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-[3px] border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm mt-4">Loading your trips...</p>
            </div>
          ) : itineraries.length === 0 ? null : (
            <div className="grid gap-4 md:grid-cols-2">
              {itineraries.map(itinerary => (
                <div
                  key={itinerary.id}
                  className="relative rounded-2xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm hover:border-teal-500/60 hover:shadow-xl transition-all"
                >
                  {confirmDeleteId === itinerary.id ? (
                    <div className="flex flex-col items-center justify-center py-4 gap-3">
                      <p className="text-sm font-semibold text-slate-800">Delete "{itinerary.title}"?</p>
                      <p className="text-xs text-slate-500">This cannot be undone.</p>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(itinerary.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link to={`/itineraries/${itinerary.id}`} className="block">
                        <h3 className="font-semibold text-lg text-slate-900 pr-8">{itinerary.title}</h3>
                        <div className="flex items-center gap-1.5 mt-2 text-slate-600 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {itinerary.destination}
                        </div>
                        {(itinerary.startDate || itinerary.start_date) && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-xs">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(itinerary.startDate || itinerary.start_date)}
                            {(itinerary.endDate || itinerary.end_date) && ` – ${formatDate(itinerary.endDate || itinerary.end_date)}`}
                          </div>
                        )}
                        {itinerary.status && (
                          <span className={`inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-lg ${
                            itinerary.status === 'active' ? 'bg-teal-100 text-teal-700'
                            : itinerary.status === 'completed' ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                          }`}>
                            {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(itinerary.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </ImmersivePage>
  );
};

export default Itineraries;
