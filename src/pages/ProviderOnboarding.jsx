import React, { useEffect, useState } from 'react';
import { Alert, Button, FormField, ImmersivePage, Input, Select } from '../components';
import { createExperience } from '../utils/experienceService';
import { createProviderOnboardingLink, getMyProvider } from '../utils/providerService';

const ProviderOnboarding = () => {
  const [provider, setProvider] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });
  const [experience, setExperience] = useState({
    destinationSlug: '',
    title: '',
    category: 'activity',
    scheduledTime: '10:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    price: '',
  });

  useEffect(() => {
    let active = true;
    getMyProvider()
      .then(response => {
        if (active) setProvider(response?.data?.provider || response?.provider);
      })
      .catch(error => {
        if (active && error.status !== 404) {
          setStatus(prev => ({ ...prev, error: error.message }));
        }
      })
      .finally(() => {
        if (active) setStatus(prev => ({ ...prev, loading: false }));
      });
    return () => {
      active = false;
    };
  }, []);

  const beginOnboarding = async () => {
    setStatus({ loading: true, error: '', success: '' });
    try {
      const response = await createProviderOnboardingLink(displayName);
      const data = response?.data || response;
      window.location.assign(data.onboardingUrl);
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Could not start onboarding', success: '' });
    }
  };

  const addExperience = async event => {
    event.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await createExperience({
        destinationSlug: experience.destinationSlug,
        title: experience.title,
        category: experience.category,
        scheduledTime: experience.scheduledTime,
        timezone: experience.timezone,
        priceCents: Math.round(Number(experience.price) * 100),
        currency: provider.defaultCurrency,
        isActive: true,
      });
      setExperience(prev => ({ ...prev, title: '', price: '' }));
      setStatus({ loading: false, error: '', success: 'Experience published.' });
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Could not publish experience', success: '' });
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2200&auto=format&fit=crop"
      tone="light"
      contentClassName="min-h-screen px-6 py-24"
    >
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/80 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Provider tools</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sell experiences on SoloWay</h1>
        <p className="mt-2 text-sm text-slate-500">Stripe securely verifies your identity and pays your share of each booking.</p>

        {status.error && <Alert tone="error" className="mt-5">{status.error}</Alert>}
        {status.success && <Alert tone="success" className="mt-5">{status.success}</Alert>}

        {!provider?.chargesEnabled ? (
          <div className="mt-7 space-y-4">
            <FormField label="Provider display name">
              <Input value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder="Your tour company" />
            </FormField>
            <Button variant="accent" size="lg" onClick={beginOnboarding} loading={status.loading}>
              {provider ? 'Continue Stripe onboarding' : 'Start Stripe onboarding'}
            </Button>
          </div>
        ) : (
          <form onSubmit={addExperience} className="mt-7 space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5">
            <Alert tone="success">Stripe payouts are active for {provider.displayName}.</Alert>
            <h2 className="text-xl font-semibold text-slate-900">Publish an experience</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Destination slug" hint="Example: lisbon" required>
                <Input value={experience.destinationSlug} onChange={event => setExperience(prev => ({ ...prev, destinationSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} required />
              </FormField>
              <FormField label="Category" required>
                <Select value={experience.category} onChange={event => setExperience(prev => ({ ...prev, category: event.target.value }))}>
                  <option value="activity">Activity or tour</option>
                  <option value="food">Food</option>
                  <option value="culture">Culture</option>
                  <option value="nightlife">Nightlife</option>
                  <option value="relax">Wellness</option>
                  <option value="other">Other</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Experience title" required>
              <Input value={experience.title} onChange={event => setExperience(prev => ({ ...prev, title: event.target.value }))} required />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Start time" required>
                <Input type="time" value={experience.scheduledTime} onChange={event => setExperience(prev => ({ ...prev, scheduledTime: event.target.value }))} required />
              </FormField>
              <FormField label={`Price (${provider.defaultCurrency.toUpperCase()})`} required>
                <Input type="number" min="0" step="0.01" value={experience.price} onChange={event => setExperience(prev => ({ ...prev, price: event.target.value }))} required />
              </FormField>
            </div>
            <FormField label="Experience time zone" hint="Use an IANA zone such as Europe/Lisbon" required>
              <Input value={experience.timezone} onChange={event => setExperience(prev => ({ ...prev, timezone: event.target.value }))} required />
            </FormField>
            <Button type="submit" variant="accent" loading={status.loading}>Publish experience</Button>
          </form>
        )}
      </section>
    </ImmersivePage>
  );
};

export default ProviderOnboarding;
