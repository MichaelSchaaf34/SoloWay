import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImmersivePage from '../components/ImmersivePage';
import {
  Users, Clock, MapPin, Loader2, Plus,
  CheckCircle2, XCircle, UserPlus, ChevronRight,
} from 'lucide-react';
import {
  getUserHistory, requestConnection, respondToConnection, closeLink,
} from '../utils/buddyService';

export default function BuddyHistory() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getUserHistory({
        page: 1,
        limit: 20,
        status: filter,
      });
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (linkId) => {
    try {
      await closeLink(linkId);
      loadHistory();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestConnect = async (linkId) => {
    try {
      await requestConnection(linkId);
      loadHistory();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespondConnect = async (connectionId, action) => {
    try {
      await respondToConnection(connectionId, action);
      loadHistory();
    } catch (err) {
      setError(err.message);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const statusColors = {
    pending: 'bg-amber-400',
    active: 'bg-green-400',
    expired: 'bg-white/20',
    cancelled: 'bg-red-400/50',
  };

  const filters = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Past', value: 'expired' },
  ];

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="dark"
      contentClassName="px-4 py-8"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Buddy History</h1>
            <p className="text-white/50 text-sm mt-1">Your invites and connections</p>
          </div>
          <Link
            to="/itineraries"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Invite
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {!loading && history && (
          <div className="space-y-3">
            {history.links?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No buddy invites yet</p>
                <p className="text-white/30 text-xs mt-1">
                  Open an itinerary item and tap "Invite Buddy" to get started
                </p>
              </div>
            ) : (
              history.links?.map((link) => (
                <div
                  key={link.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[link.status] || 'bg-white/20'}`} />
                      <span className="text-white/60 text-xs font-medium uppercase">
                        {link.status}
                      </span>
                      <span className="text-white/30 text-xs">
                        · {link.role === 'host' ? 'You hosted' : 'You joined'}
                      </span>
                    </div>
                    <span className="text-white/30 text-xs">{timeAgo(link.created_at)}</span>
                  </div>

                  {link.itinerary_items && (
                    <div className="mb-3">
                      <h3 className="text-white font-medium text-sm">
                        {link.itinerary_items.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {link.itinerary_items.location_name && (
                          <span className="flex items-center gap-1 text-white/40 text-xs">
                            <MapPin className="w-3 h-3" />
                            {link.itinerary_items.location_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-white/40 text-xs">
                          <Users className="w-3 h-3" />
                          {link.current_party_count}/{link.party_size_cap}
                        </span>
                      </div>
                    </div>
                  )}

                  {link.guest_users && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
                        {(link.guest_users.display_name || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-white/70 text-sm">{link.guest_users.display_name}</span>
                      {link.guest_users.phone_last_four && (
                        <span className="text-white/30 text-xs">···{link.guest_users.phone_last_four}</span>
                      )}
                    </div>
                  )}

                  {link.pending_connection && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 text-xs flex-1">Connection request pending</span>
                      {link.pending_connection.awaiting_your_response && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleRespondConnect(link.pending_connection.id, 'accepted')}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRespondConnect(link.pending_connection.id, 'rejected')}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {link.status === 'active' && (
                      <button
                        onClick={() => handleClose(link.id)}
                        className="px-3 py-1.5 text-xs text-white/50 border border-white/10 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        End early
                      </button>
                    )}
                    {link.status === 'expired' && !link.pending_connection && (
                      <button
                        onClick={() => handleRequestConnect(link.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Stay connected
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {history.pagination?.total_pages > 1 && (
              <p className="text-white/30 text-xs text-center pt-2">
                Page {history.pagination.page} of {history.pagination.total_pages}
              </p>
            )}
          </div>
        )}
      </div>
    </ImmersivePage>
  );
}
