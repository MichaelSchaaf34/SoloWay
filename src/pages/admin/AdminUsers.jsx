import { useEffect, useState } from 'react';
import { Search, Trash2, X } from 'lucide-react';
import { listUsers, getUserDetail, deleteUser } from '../../utils/adminService';
import {
  AdminCard, AdminTable, Pager, LoadingBlock, ErrorBlock,
  StatusBadge, formatDate, formatMoney,
} from './adminUi';

const LIMIT = 25;

function UserDetailPanel({ userId, onClose, onDeleted }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setUser(null);
    getUserDetail(userId).then(setUser).catch(err => setError(err.message));
  }, [userId]);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.email}? This removes all of their data.`)) return;
    setDeleting(true);
    try {
      await deleteUser(userId);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <AdminCard
      title="User detail"
      actions={
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      }
    >
      {error && <div className="p-4"><ErrorBlock message={error} /></div>}
      {!user && !error && <LoadingBlock />}
      {user && (
        <div className="p-5 space-y-4 text-sm">
          <div>
            <p className="text-white font-medium">{user.displayName || 'No display name'}</p>
            <p className="text-white/60">{user.email}</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-white/60">
            <div><dt className="text-white/40 text-xs">Joined</dt><dd>{formatDate(user.createdAt)}</dd></div>
            <div><dt className="text-white/40 text-xs">Last seen</dt><dd>{formatDate(user.lastSeenAt)}</dd></div>
            <div><dt className="text-white/40 text-xs">Itineraries</dt><dd>{user.itineraryCount}</dd></div>
            <div><dt className="text-white/40 text-xs">Orders</dt><dd>{user.orderCount}</dd></div>
            <div><dt className="text-white/40 text-xs">Reviews</dt><dd>{user.reviewCount}</dd></div>
            <div><dt className="text-white/40 text-xs">Email verified</dt><dd>{user.emailVerified ? 'Yes' : 'No'}</dd></div>
          </dl>
          {user.recentOrders.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">Recent orders</p>
              <ul className="space-y-2">
                {user.recentOrders.map(order => (
                  <li key={order.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <span className="truncate">{order.reference} · {order.destination}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {formatMoney(order.totalCents, order.currency)}
                      <StatusBadge status={order.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete user'}
          </button>
        </div>
      )}
    </AdminCard>
  );
}

export default function AdminUsers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const load = () => {
    listUsers({ search: activeSearch, limit: LIMIT, offset })
      .then(setData)
      .catch(err => setError(err.message));
  };

  useEffect(load, [activeSearch, offset]);

  const submitSearch = event => {
    event.preventDefault();
    setOffset(0);
    setActiveSearch(search.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Users</h1>
        <form onSubmit={submitSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search email or name..."
            className="pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 w-72"
          />
        </form>
      </div>

      {error && <ErrorBlock message={error} />}

      <div className={`grid gap-6 ${selectedUserId ? 'lg:grid-cols-[1fr_380px]' : ''}`}>
        <AdminCard>
          {!data ? <LoadingBlock /> : (
            <>
              <AdminTable
                columns={['Email', 'Name', 'Verified', 'Joined', 'Last seen']}
                rows={data.users}
                emptyMessage="No users match this search."
                renderRow={user => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`cursor-pointer hover:bg-white/5 ${selectedUserId === user.id ? 'bg-white/5' : ''}`}
                  >
                    <td className="px-5 py-3">
                      {user.email}
                      {user.isAdmin && (
                        <span className="ml-2 text-xs text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">admin</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-white/60">{user.displayName || '—'}</td>
                    <td className="px-5 py-3 text-white/60">{user.emailVerified ? 'Yes' : 'No'}</td>
                    <td className="px-5 py-3 text-white/60">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3 text-white/60">{formatDate(user.lastSeenAt)}</td>
                  </tr>
                )}
              />
              <Pager offset={offset} limit={LIMIT} total={data.total} onChange={setOffset} />
            </>
          )}
        </AdminCard>

        {selectedUserId && (
          <UserDetailPanel
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onDeleted={() => {
              setSelectedUserId(null);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
}
