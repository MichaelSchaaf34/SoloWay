import { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Share2, Clock, RefreshCw } from 'lucide-react';
import QRDisplay from './ui/QRDisplay';
import { createInvite, cancelInvite } from '../utils/buddyService';

export default function InviteBuddyModal({ itineraryItem, onClose }) {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateInvite();
  }, []);

  const generateInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createInvite(itineraryItem.id);
      setInvite(data);
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!invite?.token) return;
    try {
      await cancelInvite(invite.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel invite');
    }
  };

  const copyLink = async () => {
    if (!invite?.qr_url) return;
    try {
      await navigator.clipboard.writeText(invite.qr_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = invite.qr_url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (!invite?.qr_url || !navigator.share) return;
    try {
      await navigator.share({
        title: `Join me: ${itineraryItem.title}`,
        text: `I'm inviting you to join me for ${itineraryItem.title} on SoloWay!`,
        url: invite.qr_url,
      });
    } catch {
      // User cancelled share dialog
    }
  };

  const getTimeRemaining = () => {
    if (!invite?.expires_at) return null;
    const diffMs = new Date(invite.expires_at) - new Date();
    if (diffMs <= 0) return 'Expired';
    const mins = Math.floor(diffMs / 60000);
    return `${mins}m remaining`;
  };

  const formatItemTime = () => {
    if (!itineraryItem.scheduledDate) return null;
    const date = new Date(itineraryItem.scheduledDate).toLocaleDateString([], {
      dateStyle: 'medium',
    });
    const time = itineraryItem.startTime
      ? itineraryItem.startTime.slice(0, 5)
      : null;
    return time ? `${date} at ${time}` : date;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Invite a Buddy</h2>
          <p className="text-white/60 text-sm mt-1">{itineraryItem.title}</p>
          {formatItemTime() && (
            <p className="text-white/40 text-xs mt-1">{formatItemTime()}</p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
            <p className="text-white/50 text-sm">Generating invite...</p>
          </div>
        )}

        {invite && !loading && (
          <div className="flex flex-col items-center gap-5">
            <QRDisplay url={invite.qr_url} size={180} />

            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeRemaining()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {invite.already_exists ? 'Existing invite' : 'New invite'}
              </span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
            </div>

            {invite.status === 'pending' && (
              <button
                onClick={handleCancel}
                className="text-white/40 hover:text-red-400 text-xs transition-colors"
              >
                Cancel this invite
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center">
            {error}
            <button
              onClick={generateInvite}
              className="block mx-auto mt-2 text-white/50 hover:text-white text-xs underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
