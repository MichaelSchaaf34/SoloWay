import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CityAutocomplete, ImmersivePage } from '../components';
import {
  addItineraryItem,
  deleteItinerary,
  deleteItineraryItem,
  getItinerary,
  updateItinerary,
  updateItineraryItem,
} from '../utils/itineraryService';
import { US_STATE_OPTIONS } from '../utils/usStates';
import { formatDestination, parseDestination } from '../utils/destination';
import {
  applySelection,
  getCitySuggestions,
  getCountryOptions,
  getRegionOptions,
} from '../utils/destinationSelector';

const defaultItemForm = {
  title: '',
  scheduledDate: '',
  startTime: '',
  endTime: '',
  category: 'activity',
  locationName: '',
  description: '',
  isFlexible: false,
};

const ItineraryDetail = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [error, setError] = useState('');
  const [itemForm, setItemForm] = useState(defaultItemForm);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getItinerary(itineraryId);
        const data = response?.data || response;
        const nextItinerary = data?.itinerary || data;
        const parsed = parseDestination(nextItinerary?.destination);
        if (mounted) setItinerary({ ...nextItinerary, ...parsed });
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load itinerary');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [itineraryId]);

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const regionOptions = useMemo(
    () => getRegionOptions(itinerary?.destinationCountry),
    [itinerary?.destinationCountry]
  );
  const citySuggestions = useMemo(
    () => getCitySuggestions(itinerary?.destinationCountry, itinerary?.destinationRegion),
    [itinerary?.destinationCountry, itinerary?.destinationRegion]
  );

  const commitSelection = (type, value) => {
    setItinerary(prev => {
      if (!prev) return prev;
      const resolved = applySelection(type, value, {
        country: prev.destinationCountry,
        region: prev.destinationRegion,
        city: prev.destinationCity,
      });
      return {
        ...prev,
        destinationCountry: resolved.country,
        destinationRegion: resolved.region,
        destinationCity: resolved.city,
      };
    });
  };

  const updateCity = value => {
    setItinerary(prev => (prev ? { ...prev, destinationCity: value } : prev));
    const resolved = applySelection('city', value, {
      country: itinerary?.destinationCountry || '',
      region: itinerary?.destinationRegion || '',
      city: itinerary?.destinationCity || '',
    });
    if (resolved.city !== value || resolved.country || resolved.region) {
      setItinerary(prev => (prev ? {
        ...prev,
        destinationCountry: resolved.country,
        destinationRegion: resolved.region,
        destinationCity: resolved.city,
      } : prev));
    }
  };

  const updateMeta = (key, value) => {
    setItinerary(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSaveMeta = async () => {
    if (!itinerary) return;
    setIsSavingMeta(true);
    setError('');
    try {
      if (!itinerary.destinationCountry || !itinerary.destinationCity) {
        setError('Please provide country and city for destination.');
        return;
      }
      if (itinerary.destinationCountry === 'United States' && !itinerary.destinationRegion) {
        setError('Please select a state for United States trips.');
        return;
      }
      const payload = {
        title: itinerary.title,
        destination: formatDestination({
          country: itinerary.destinationCountry,
          region: itinerary.destinationRegion,
          city: itinerary.destinationCity,
        }),
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        mood: itinerary.mood,
        status: itinerary.status,
        isPublic: itinerary.isPublic,
      };
      const response = await updateItinerary(itinerary.id, payload);
      const data = response?.data || response;
      const updated = data?.itinerary || data;
      const parsed = parseDestination(updated?.destination);
      setItinerary(prev => ({ ...prev, ...updated, ...parsed, items: prev?.items || [] }));
    } catch (e) {
      setError(e.message || 'Could not save itinerary changes');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleAddItem = async event => {
    event.preventDefault();
    if (!itinerary) return;
    setIsAddingItem(true);
    setError('');
    try {
      const response = await addItineraryItem(itinerary.id, itemForm);
      const data = response?.data || response;
      const item = data?.item || data;
      setItinerary(prev => ({ ...prev, items: [...(prev?.items || []), item] }));
      setItemForm({ ...defaultItemForm, scheduledDate: itinerary.startDate || '' });
    } catch (e) {
      setError(e.message || 'Could not add itinerary item');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async itemId => {
    if (!itinerary) return;
    try {
      await deleteItineraryItem(itinerary.id, itemId);
      setItinerary(prev => ({ ...prev, items: (prev?.items || []).filter(item => item.id !== itemId) }));
    } catch (e) {
      setError(e.message || 'Could not delete item');
    }
  };

  const handleToggleFlexible = async item => {
    if (!itinerary) return;
    try {
      const response = await updateItineraryItem(itinerary.id, item.id, {
        isFlexible: !item.isFlexible,
      });
      const data = response?.data || response;
      const updatedItem = data?.item || data;
      setItinerary(prev => ({
        ...prev,
        items: (prev?.items || []).map(entry => (entry.id === item.id ? updatedItem : entry)),
      }));
    } catch (e) {
      setError(e.message || 'Could not update item');
    }
  };

  const handleDeleteItinerary = async () => {
    if (!itinerary) return;
    const ok = window.confirm('Delete this itinerary and all items?');
    if (!ok) return;
    try {
      await deleteItinerary(itinerary.id);
      navigate('/itineraries', { replace: true });
    } catch (e) {
      setError(e.message || 'Could not delete itinerary');
    }
  };

  if (isLoading) {
    return (
      <ImmersivePage
        imageUrl="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2200&auto=format&fit=crop"
        imagePosition="center"
        tone="light"
        contentClassName="flex min-h-screen items-center justify-center"
      >
        Loading itinerary...
      </ImmersivePage>
    );
  }

  if (!itinerary) {
    return (
      <ImmersivePage
        imageUrl="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2200&auto=format&fit=crop"
        imagePosition="center"
        tone="light"
        contentClassName="flex min-h-screen items-center justify-center"
      >
        Could not load itinerary.
      </ImmersivePage>
    );
  }

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-16"
    >
      <section className="max-w-6xl mx-auto">
        <Link to="/itineraries" className="text-teal-700 text-sm hover:text-teal-800">← Back to itineraries</Link>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">Itinerary detail</h1>
        {error && <p className="mt-5 rounded-xl border border-rose-300 bg-rose-50/90 px-4 py-3 text-rose-700">{error}</p>}

        <section className="mt-6 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Trip settings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="text" value={itinerary.title} onChange={e => updateMeta('title', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <select value={itinerary.destinationCountry || ''} onChange={e => commitSelection('country', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="" disabled>Select destination country</option>
              {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
            <CityAutocomplete
              placeholder="City (type to search)"
              value={itinerary.destinationCity || ''}
              suggestions={citySuggestions}
              onChange={updateCity}
            />
            {itinerary.destinationCountry === 'United States' ? (
              <select value={itinerary.destinationRegion || ''} onChange={e => commitSelection('region', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
                <option value="" disabled>Select state</option>
                {US_STATE_OPTIONS.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            ) : (
              <select value={itinerary.destinationRegion || ''} onChange={e => commitSelection('region', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
                <option value="" disabled>Select region/state</option>
                {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            )}
            <input type="date" value={itinerary.startDate?.slice(0, 10) || ''} onChange={e => updateMeta('startDate', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <input type="date" value={itinerary.endDate?.slice(0, 10) || ''} min={itinerary.startDate?.slice(0, 10) || undefined} onChange={e => updateMeta('endDate', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <select value={itinerary.mood} onChange={e => updateMeta('mood', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="balanced">Balanced</option>
              <option value="chill">Chill</option>
              <option value="adventure">Adventure</option>
            </select>
            <select value={itinerary.status} onChange={e => updateMeta('status', e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <label className="text-sm text-slate-700 flex items-center gap-3">
              <input type="checkbox" checked={Boolean(itinerary.isPublic)} onChange={e => updateMeta('isPublic', e.target.checked)} />
              Public itinerary
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleSaveMeta} disabled={isSavingMeta} className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-semibold disabled:opacity-70">{isSavingMeta ? 'Saving...' : 'Save trip settings'}</button>
            <button onClick={handleDeleteItinerary} className="px-5 py-2.5 rounded-xl border border-rose-400/70 text-rose-700 hover:bg-rose-100 font-semibold">Delete itinerary</button>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Add itinerary item</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleAddItem}>
            <input type="text" placeholder="Title" value={itemForm.title} required onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <input type="date" value={itemForm.scheduledDate} required onChange={e => setItemForm(prev => ({ ...prev, scheduledDate: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <input type="time" value={itemForm.startTime} onChange={e => setItemForm(prev => ({ ...prev, startTime: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <input type="time" value={itemForm.endTime} onChange={e => setItemForm(prev => ({ ...prev, endTime: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <select value={itemForm.category} onChange={e => setItemForm(prev => ({ ...prev, category: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900">
              <option value="activity">Activity</option><option value="food">Food</option><option value="transport">Transport</option><option value="accommodation">Accommodation</option><option value="relax">Relax</option><option value="culture">Culture</option><option value="nightlife">Nightlife</option><option value="other">Other</option>
            </select>
            <input type="text" placeholder="Location name" value={itemForm.locationName} onChange={e => setItemForm(prev => ({ ...prev, locationName: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <textarea placeholder="Description (optional)" value={itemForm.description} onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="md:col-span-2 px-4 py-3 rounded-xl border border-slate-300 bg-white/90 text-slate-900" />
            <label className="text-sm text-slate-700 flex items-center gap-3 md:col-span-2"><input type="checkbox" checked={itemForm.isFlexible} onChange={e => setItemForm(prev => ({ ...prev, isFlexible: e.target.checked }))} />Flexible timing</label>
            <div className="md:col-span-2">
              <button type="submit" disabled={isAddingItem} className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 font-semibold disabled:opacity-70">{isAddingItem ? 'Adding...' : 'Add item'}</button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Planned items</h2>
          {!itinerary.items?.length ? (
            <p className="text-slate-600 mt-3">No items yet. Add your first item above.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {itinerary.items.map(item => (
                <article key={item.id} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-lg backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{new Date(item.scheduledDate).toLocaleDateString()}{item.startTime ? ` • ${item.startTime.slice(0, 5)}` : ''}{item.category ? ` • ${item.category}` : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleFlexible(item)} className={`px-3 py-2 rounded-lg text-sm font-semibold border ${item.isFlexible ? 'border-emerald-500/70 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-700 bg-white'}`}>{item.isFlexible ? 'Flexible' : 'Fixed'}</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="px-3 py-2 rounded-lg text-sm font-semibold border border-rose-400/70 text-rose-700 hover:bg-rose-100">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </ImmersivePage>
  );
};

export default ItineraryDetail;
