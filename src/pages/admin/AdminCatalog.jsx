import { useEffect, useState } from 'react';
import { listProviders, listExperiences, setExperienceActive } from '../../utils/adminService';
import {
  AdminCard, AdminTable, Pager, LoadingBlock, ErrorBlock,
  StatusBadge, formatMoney,
} from './adminUi';

const LIMIT = 25;

export default function AdminCatalog() {
  const [providers, setProviders] = useState(null);
  const [experiences, setExperiences] = useState(null);
  const [providerFilter, setProviderFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    listProviders().then(setProviders).catch(err => setError(err.message));
  }, []);

  const loadExperiences = () => {
    listExperiences({ providerId: providerFilter || undefined, limit: LIMIT, offset })
      .then(setExperiences)
      .catch(err => setError(err.message));
  };

  useEffect(loadExperiences, [providerFilter, offset]);

  const toggleActive = async experience => {
    setTogglingId(experience.id);
    try {
      await setExperienceActive(experience.id, !experience.isActive);
      loadExperiences();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Providers & Experiences</h1>

      {error && <ErrorBlock message={error} />}

      <AdminCard title="Providers">
        {!providers ? <LoadingBlock /> : (
          <AdminTable
            columns={['Provider', 'Owner', 'Status', 'Payments', 'Commission', 'Experiences']}
            rows={providers}
            emptyMessage="No providers have onboarded yet."
            renderRow={provider => (
              <tr key={provider.id}>
                <td className="px-5 py-3">{provider.displayName}</td>
                <td className="px-5 py-3 text-white/60">{provider.userEmail}</td>
                <td className="px-5 py-3"><StatusBadge status={provider.onboardingStatus} /></td>
                <td className="px-5 py-3 text-white/60">
                  {provider.chargesEnabled && provider.payoutsEnabled ? 'Ready' : 'Not ready'}
                </td>
                <td className="px-5 py-3 text-white/60">{(provider.defaultCommissionBps / 100).toFixed(1)}%</td>
                <td className="px-5 py-3 text-white/60">{provider.experienceCount}</td>
              </tr>
            )}
          />
        )}
      </AdminCard>

      <AdminCard
        title="Experiences"
        actions={
          providers && providers.length > 0 && (
            <select
              value={providerFilter}
              onChange={event => {
                setOffset(0);
                setProviderFilter(event.target.value);
              }}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            >
              <option value="">All providers</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.displayName}</option>
              ))}
            </select>
          )
        }
      >
        {!experiences ? <LoadingBlock /> : (
          <>
            <AdminTable
              columns={['Title', 'Provider', 'Destination', 'Category', 'Price', 'Status', '']}
              rows={experiences.experiences}
              emptyMessage="No experiences found."
              renderRow={experience => (
                <tr key={experience.id}>
                  <td className="px-5 py-3">{experience.title}</td>
                  <td className="px-5 py-3 text-white/60">{experience.providerName}</td>
                  <td className="px-5 py-3 text-white/60">{experience.destinationSlug}</td>
                  <td className="px-5 py-3 text-white/60">{experience.category}</td>
                  <td className="px-5 py-3 text-white/60">
                    {formatMoney(experience.priceCents, experience.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={experience.isActive ? 'active' : 'disabled'} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActive(experience)}
                      disabled={togglingId === experience.id}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs"
                    >
                      {experience.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              )}
            />
            <Pager offset={offset} limit={LIMIT} total={experiences.total} onChange={setOffset} />
          </>
        )}
      </AdminCard>
    </div>
  );
}
