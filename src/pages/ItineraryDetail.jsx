import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Plus, Trash2, Users, CalendarDays,
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CityAutocomplete,
  EmptyState,
  FormField,
  ImmersivePage,
  Input,
  PageHeader,
  Select,
  SkeletonCard,
} from '../components';
import InviteBuddyModal from '../components/InviteBuddyModal';
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

const CATEGORY_LABELS = {
  activity: 'Activity',
  food: 'Food',
  transport: 'Transport',
  accommodation: 'Stay',
  relax: 'Relax',
  culture: 'Culture',
  nightlife: 'Nightlife',
  other: 'Other',
};

const ItineraryDetail = () => {
  const { itineraryId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [itemForm, setItemForm] = useState(defaultItemForm);
  const [inviteItem, setInviteItem] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    return () => { mounted = false; };
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
      setShowSettings(false);
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
      setItinerary(prev => ({
        ...prev,
        items: (prev?.items || []).filter(item => item.id !== itemId),
      }));
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
    setIsDeleting(true);
    try {
      await deleteItinerary(itinerary.id);
      navigate('/itineraries', { replace: true });
    } catch (e) {
      setError(e.message || 'Could not delete itinerary');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const commonBg = 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2200&auto=format&fit=crop';

  if (isLoading) {
    return (
      <ImmersivePage imageUrl={commonBg} imagePosition="center" tone="light" contentClassName="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </ImmersivePage>
    );
  }

  if (!itinerary) {
    return (
      <ImmersivePage imageUrl={commonBg} imagePosition="center" tone="light" contentClassName="px-6 py-16">
        <div className="max-w-md mx-auto">
          <EmptyState
            icon={MapPin}
            title="Couldn't load itinerary"
            description="This itinerary may have been deleted, or the link is invalid."
            action={
              <Button variant="accent" onClick={() => navigate('/itineraries')}>
                Back to itineraries
              </Button>
            }
          />
        </div>
      </ImmersivePage>
    );
  }

  const dateRange = itinerary.startDate && itinerary.endDate
    ? `${new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : null;

  return (
    <ImmersivePage imageUrl={commonBg} imagePosition="center" tone="light" contentClassName="px-6 py-16">
      <section className="max-w-3xl mx-auto">
        <PageHeader
          eyebrow={itinerary.status ? itinerary.status.toUpperCase() : 'Trip'}
          title={itinerary.title}
          description={
            <span className="inline-flex items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {itinerary.destination}
              </span>
              {dateRange && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  {dateRange}
                </span>
              )}
            </span>
          }
          backTo="/itineraries"
          backLabel="All itineraries"
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(s => !s)}
            >
              {showSettings ? 'Hide settings' : 'Trip settings'}
            </Button>
          }
        />

        {error && <Alert tone="error" className="mb-6">{error}</Alert>}

        <div className="space-y-6">
          {/* Planned items */}
          <Card tone="glass" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Planned items</h2>
              <span className="text-xs text-slate-500">
                {(itinerary.items || []).length} item{(itinerary.items || []).length === 1 ? '' : 's'}
              </span>
            </div>

            {!itinerary.items?.length ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing planned yet"
                description="Add your first activity below — you can always adjust times and details later."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="space-y-2">
                {itinerary.items.map(item => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-slate-900 truncate">{item.title}</h3>
                        <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          {new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {item.startTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                            {item.startTime.slice(0, 5)}
                          </span>
                        )}
                        {item.locationName && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                            {item.locationName}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        iconLeft={Users}
                        onClick={() => setInviteItem(item)}
                      >
                        Invite
                      </Button>
                      <Button
                        variant={item.isFlexible ? 'accent' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleFlexible(item)}
                        title={item.isFlexible ? 'Timing is flexible' : 'Fixed timing'}
                      >
                        {item.isFlexible ? 'Flexible' : 'Fixed'}
                      </Button>
                      <Button
                        variant="dangerGhost"
                        size="sm"
                        iconLeft={Trash2}
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label={`Delete ${item.title}`}
                      >
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Add item */}
          <Card tone="glass" padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Add itinerary item</h2>
            <p className="text-sm text-slate-500 mb-5">Plan a new stop, activity, or break.</p>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddItem} noValidate>
              <FormField label="Title" required className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="e.g. Sunrise hike, Pastéis de Belém"
                  required
                  value={itemForm.title}
                  onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </FormField>

              <FormField label="Date" required>
                <Input
                  type="date"
                  required
                  value={itemForm.scheduledDate}
                  min={itinerary.startDate?.slice(0, 10)}
                  max={itinerary.endDate?.slice(0, 10)}
                  onChange={e => setItemForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Category">
                <Select
                  value={itemForm.category}
                  onChange={e => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Start time">
                <Input
                  type="time"
                  value={itemForm.startTime}
                  onChange={e => setItemForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </FormField>

              <FormField label="End time">
                <Input
                  type="time"
                  value={itemForm.endTime}
                  onChange={e => setItemForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </FormField>

              <FormField label="Location name" className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="e.g. Arashiyama Bamboo Grove"
                  value={itemForm.locationName}
                  onChange={e => setItemForm(prev => ({ ...prev, locationName: e.target.value }))}
                />
              </FormField>

              <FormField label="Description" className="md:col-span-2">
                <textarea
                  placeholder="Optional notes, addresses, reservation numbers…"
                  value={itemForm.description}
                  onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-colors outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 hover:border-slate-300"
                />
              </FormField>

              <label className="md:col-span-2 flex items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={itemForm.isFlexible}
                  onChange={e => setItemForm(prev => ({ ...prev, isFlexible: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Timing is flexible — can move within the day
              </label>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  iconLeft={Plus}
                  loading={isAddingItem}
                >
                  Add item
                </Button>
              </div>
            </form>
          </Card>

          {/* Trip settings */}
          {showSettings && (
            <Card tone="glass" padding="lg">
              <div className="flex items-start justify-between mb-5 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Trip settings</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Rename, change dates, or update visibility.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>Close</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Trip title" className="md:col-span-2">
                  <Input
                    type="text"
                    value={itinerary.title}
                    onChange={e => updateMeta('title', e.target.value)}
                  />
                </FormField>

                <FormField label="Country">
                  <Select
                    value={itinerary.destinationCountry || ''}
                    onChange={e => commitSelection('country', e.target.value)}
                  >
                    <option value="" disabled>Select a country</option>
                    {countryOptions.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={itinerary.destinationCountry === 'United States' ? 'State' : 'Region / state'}>
                  {itinerary.destinationCountry === 'United States' ? (
                    <Select
                      value={itinerary.destinationRegion || ''}
                      onChange={e => commitSelection('region', e.target.value)}
                    >
                      <option value="" disabled>Select state</option>
                      {US_STATE_OPTIONS.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={itinerary.destinationRegion || ''}
                      onChange={e => commitSelection('region', e.target.value)}
                    >
                      <option value="">Optional</option>
                      {regionOptions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </Select>
                  )}
                </FormField>

                <FormField label="City" className="md:col-span-2">
                  <CityAutocomplete
                    placeholder="Type to search..."
                    value={itinerary.destinationCity || ''}
                    suggestions={citySuggestions}
                    onChange={updateCity}
                  />
                </FormField>

                <FormField label="Start date">
                  <Input
                    type="date"
                    value={itinerary.startDate?.slice(0, 10) || ''}
                    onChange={e => updateMeta('startDate', e.target.value)}
                  />
                </FormField>

                <FormField label="End date">
                  <Input
                    type="date"
                    value={itinerary.endDate?.slice(0, 10) || ''}
                    min={itinerary.startDate?.slice(0, 10) || undefined}
                    onChange={e => updateMeta('endDate', e.target.value)}
                  />
                </FormField>

                <FormField label="Mood">
                  <Select
                    value={itinerary.mood}
                    onChange={e => updateMeta('mood', e.target.value)}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="chill">Chill</option>
                    <option value="adventure">Adventure</option>
                  </Select>
                </FormField>

                <FormField label="Status">
                  <Select
                    value={itinerary.status}
                    onChange={e => updateMeta('status', e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormField>

                <label className="md:col-span-2 flex items-center gap-2.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(itinerary.isPublic)}
                    onChange={e => updateMeta('isPublic', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  Public itinerary — visible to anyone with the link
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <Button
                  variant="dangerGhost"
                  iconLeft={Trash2}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete itinerary
                </Button>
                <Button
                  variant="accent"
                  loading={isSavingMeta}
                  onClick={handleSaveMeta}
                >
                  Save changes
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {inviteItem && (
        <InviteBuddyModal
          itineraryItem={inviteItem}
          onClose={() => setInviteItem(null)}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <Card
            tone="base"
            padding="lg"
            shadow="lg"
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-slate-900">
              Delete this itinerary?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              &ldquo;{itinerary.title}&rdquo; and all of its items will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteItinerary}
                loading={isDeleting}
              >
                Delete itinerary
              </Button>
            </div>
          </Card>
        </div>
      )}
    </ImmersivePage>
  );
};

export default ItineraryDetail;
