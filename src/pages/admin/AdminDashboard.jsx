import { useEffect, useState } from 'react';
import { Users, Mail, Map, Store, Star, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { getStats } from '../../utils/adminService';
import { AdminCard, LoadingBlock, ErrorBlock, StatusBadge, formatMoney } from './adminUi';

function StatTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorBlock message={error} />;
  if (!stats) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Users}
          label="Users"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsers7d} in the last 7 days`}
        />
        <StatTile icon={Mail} label="Waitlist" value={stats.waitlistCount.toLocaleString()} />
        <StatTile icon={Map} label="Itineraries" value={stats.itineraryCount.toLocaleString()} />
        <StatTile
          icon={Store}
          label="Providers"
          value={stats.providerCount.toLocaleString()}
          sub={`${stats.activeExperienceCount} active experiences`}
        />
        <StatTile icon={ShoppingCart} label="Orders" value={stats.orderCount.toLocaleString()} />
        <StatTile
          icon={DollarSign}
          label="Gross revenue"
          value={formatMoney(stats.grossRevenueCents)}
          sub="Paid and fulfilled orders"
        />
        <StatTile
          icon={TrendingUp}
          label="Commission earned"
          value={formatMoney(stats.commissionRevenueCents)}
        />
        <StatTile icon={Star} label="Reviews" value={stats.reviewCount.toLocaleString()} />
      </div>

      <AdminCard title="Orders by status">
        {stats.ordersByStatus.length === 0 ? (
          <p className="px-5 py-8 text-sm text-white/40 text-center">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {stats.ordersByStatus.map(({ status, count }) => (
              <li key={status} className="flex items-center justify-between px-5 py-3">
                <StatusBadge status={status} />
                <span className="text-sm text-white/80">{count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
