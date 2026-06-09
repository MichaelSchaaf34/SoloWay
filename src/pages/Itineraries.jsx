import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Trash2, Compass } from 'lucide-react';
import { createItinerary, deleteItinerary, getMyItineraries } from '../utils/itineraryService';
import {
  Alert,
  Button,
  Card,
  CityAutocomplete,
  EmptyState,
  FormField,
  ImmersivePage,
  Input,
  LoadingSkeleton,
  PageHeader,
  Select,
} from '../components';
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

const STATUS_TONES = {
  active: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  completed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const Itineraries = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-16"
    >
      <section className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Your trips"
          title="My itineraries"
          description="Every trip you've planned, in one place."
          backTo="/start"
          backLabel="Back to first choices"
          actions={
            !isLoading && itineraries.length > 0 && !showCreateForm ? (
              <Button
                variant="accent"
                iconLeft={Plus}
                onClick={() => setShowCreateForm(true)}
              >
                New trip
              </Button>
            ) : null
          }
        />

        {error && <Alert tone="error" className="mb-6">{error}</Alert>}

        {showCreateForm && (
          <Card tone="glass" padding="lg" className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {itineraries.length === 0 ? 'Plan your first adventure' : 'Create a new trip'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {itineraries.length === 0
                    ? 'Fill in the details below to get started.'
                    : 'Add your destination and dates — you can refine the rest later.'}
                </p>
              </div>
              {itineraries.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Close
                </Button>
              )}
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate} noValidate>
              <FormField label="Trip title" required className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="e.g. Solo week in Lisbon"
                  required
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </FormField>

              <FormField label="Country" required>
                <Select
                  required
                  value={form.destinationCountry}
                  onChange={e => commitSelection('country', e.target.value)}
                >
                  <option value="" disabled>Select a country</option>
                  {countryOptions.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={form.destinationCountry === 'United States' ? 'State' : 'Region / state'}
                required={form.destinationCountry === 'United States'}
              >
                {form.destinationCountry === 'United States' ? (
                  <Select
                    required
                    value={form.destinationRegion}
                    onChange={e => commitSelection('region', e.target.value)}
                  >
                    <option value="" disabled>Select state</option>
                    {US_STATE_OPTIONS.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    value={form.destinationRegion}
                    onChange={e => commitSelection('region', e.target.value)}
                  >
                    <option value="">Optional</option>
                    {regionOptions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </Select>
                )}
              </FormField>

              <FormField label="City" required className="md:col-span-2">
                <CityAutocomplete
                  placeholder="Type to search..."
                  required
                  value={form.destinationCity}
                  suggestions={citySuggestions}
                  onChange={updateCity}
                />
              </FormField>

              <FormField label="Start date" required>
                <Input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </FormField>

              <FormField label="End date" required>
                <Input
                  type="date"
                  required
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Mood">
                <Select
                  value={form.mood}
                  onChange={e => setForm(prev => ({ ...prev, mood: e.target.value }))}
                >
                  <option value="balanced">Balanced</option>
                  <option value="chill">Chill</option>
                  <option value="adventure">Adventure</option>
                </Select>
              </FormField>

              <label className="md:col-span-1 flex items-center gap-2.5 text-sm text-slate-600 self-end pb-3">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={e => setForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Make itinerary public
              </label>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={isSubmitting}
                >
                  Create itinerary
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : itineraries.length === 0 ? (
          !showCreateForm && (
            <EmptyState
              icon={Compass}
              title="No trips yet"
              description="Start planning your first adventure — destinations, dates, and everything in between."
              action={
                <Button
                  variant="accent"
                  iconLeft={Plus}
                  onClick={() => setShowCreateForm(true)}
                >
                  Plan your first trip
                </Button>
              }
            />
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {itineraries.map(itinerary => (
              <Card
                key={itinerary.id}
                tone="glass"
                padding="md"
                shadow="md"
                className="relative group"
              >
                {confirmDeleteId === itinerary.id ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-3 text-center">
                    <p className="text-sm font-semibold text-slate-900">
                      Delete &ldquo;{itinerary.title}&rdquo;?
                    </p>
                    <p className="text-xs text-slate-500">This cannot be undone.</p>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(itinerary.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to={`/itineraries/${itinerary.id}`} className="block pr-10">
                      <h3 className="font-semibold text-lg text-slate-900 leading-tight">
                        {itinerary.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        {itinerary.destination}
                      </div>
                      {(itinerary.startDate || itinerary.start_date) && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 tabular-nums">
                          <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          {formatDate(itinerary.startDate || itinerary.start_date)}
                          {(itinerary.endDate || itinerary.end_date) &&
                            ` – ${formatDate(itinerary.endDate || itinerary.end_date)}`}
                        </div>
                      )}
                      {itinerary.status && (
                        <span
                          className={`inline-flex items-center mt-3 text-[11px] font-medium px-2 py-0.5 rounded-md ring-1 ring-inset ${
                            STATUS_TONES[itinerary.status] || STATUS_TONES.draft
                          }`}
                        >
                          {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => setConfirmDeleteId(itinerary.id)}
                      className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Delete ${itinerary.title}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </ImmersivePage>
  );
};

export default Itineraries;
