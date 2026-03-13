# QR Buddy Frontend Implementation Guide (Revised)

**Feature:** QR Buddy System — Frontend UI  
**Backend:** `buddy.service.js` + `guest.service.js` already complete  
**DB:** 4 tables confirmed (`guest_users`, `buddy_links`, `buddy_link_log`, `buddy_connections`)  
**Key insight:** Invites are tied to a **specific itinerary item** (not a generic buddy link). The guest flow uses **SMS phone verification**, not just a name.

---

## How the Actual Flow Works

Understanding this before coding is critical — it's different from a typical "share a link" feature.

**Host side:**
1. Host views an itinerary item (e.g., "Dinner at Mercado da Ribeira, 8pm")
2. Host taps "Invite Buddy" on that item
3. Backend calls `createInvite(hostUserId, itineraryItemId)` → returns a token
4. Frontend builds QR URL: `{APP_BASE_URL}/join/{token}`
5. Host shows QR code to someone they've met

**Guest side (multi-step):**
1. Guest scans QR → lands on `/join/:token`
2. Page calls `getInviteByToken(token)` → sees event details, host name, spots remaining
3. Guest enters phone number + display name
4. Backend calls `initiateGuestVerification(token, phone, name)` → SMS code sent
5. Guest enters the 6-digit code
6. Backend calls `confirmGuestAndActivate(token, phone, code)` → link becomes active
7. Guest sees confirmation: "You're in!"

**Post-event:**
1. After the event ends (link status = `expired`), either party can request a connection
2. `requestConnection(linkId, userId)` → creates a pending connection
3. Other party responds via `respondToConnection(connectionId, userId, 'accepted'|'rejected')`

---

## Build Order

1. Install dependency (`qrcode.react`)
2. Frontend service files (`buddyApi.js` + `guestApi.js` in `src/utils/`)
3. QR display component (reusable)
4. Invite button + modal for itinerary items
5. GuestJoin page (public, multi-step: `/join/:token`)
6. BuddyHistory page (authenticated)
7. Route wiring in `App.jsx`
8. Verification checklist

---

## Step 1 — Install QR Code Library

```bash
npm install qrcode.react
```

---

## Step 2 — Frontend Service Files

Your backend service files are in `backend/src/modules/buddy/`. You need **frontend** API wrappers that call those endpoints. Check if `buddyService.js` and `guestService.js` already exist in `src/utils/`. If they do, compare the method names below to what's there and adjust. If they DON'T exist yet, create them.

**File:** `src/utils/buddyApi.js`

```js
import { apiRequest } from './apiClient';

// Host creates an invite for a specific itinerary item
// POST /api/v1/buddy/invite
export async function createInvite(itineraryItemId, options = {}) {
  return apiRequest('/api/v1/buddy/invite', {
    method: 'POST',
    body: JSON.stringify({
      itinerary_item_id: itineraryItemId,
      party_size_cap: options.partySizeCap || 5,
      token_ttl_minutes: options.tokenTtlMinutes || 15,
    }),
    auth: true,
  });
}

// Host cancels a pending invite
// DELETE /api/v1/buddy/invite/:token
export async function cancelInvite(token) {
  return apiRequest(`/api/v1/buddy/invite/${token}`, {
    method: 'DELETE',
    auth: true,
  });
}

// Host or guest closes an active link
// POST /api/v1/buddy/links/:linkId/close
export async function closeLink(linkId) {
  return apiRequest(`/api/v1/buddy/links/${linkId}/close`, {
    method: 'POST',
    auth: true,
  });
}

// Get user's buddy history (paginated, filterable by status)
// GET /api/v1/buddy/history?page=1&limit=20&status=active
export async function getUserHistory(options = {}) {
  const params = new URLSearchParams();
  if (options.page) params.set('page', options.page);
  if (options.limit) params.set('limit', options.limit);
  if (options.status) params.set('status', options.status);
  const qs = params.toString();
  return apiRequest(`/api/v1/buddy/history${qs ? '?' + qs : ''}`, { auth: true });
}

// Get detail + audit log for a specific link
// GET /api/v1/buddy/links/:linkId
export async function getLinkDetail(linkId) {
  return apiRequest(`/api/v1/buddy/links/${linkId}`, { auth: true });
}

// Request a permanent connection after event ends
// POST /api/v1/buddy/links/:linkId/connect
export async function requestConnection(linkId) {
  return apiRequest(`/api/v1/buddy/links/${linkId}/connect`, {
    method: 'POST',
    auth: true,
  });
}

// Respond to a connection request (accept / rejected)
// POST /api/v1/buddy/connections/:connectionId/respond
export async function respondToConnection(connectionId, action) {
  return apiRequest(`/api/v1/buddy/connections/${connectionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
    auth: true,
  });
}
```

**File:** `src/utils/guestApi.js`

```js
import { apiRequest } from './apiClient';

// Guest validates a token (no auth required)
// GET /api/v1/buddy/join/:token
export async function getInviteInfo(token) {
  return apiRequest(`/api/v1/buddy/join/${token}`);
}

// Guest submits phone + name to start verification
// POST /api/v1/buddy/join/:token/verify
export async function startVerification(token, phoneNumber, displayName) {
  return apiRequest(`/api/v1/buddy/join/${token}/verify`, {
    method: 'POST',
    body: JSON.stringify({
      phone_number: phoneNumber,
      display_name: displayName,
    }),
  });
}

// Guest submits SMS code to confirm and activate
// POST /api/v1/buddy/join/:token/confirm
export async function confirmCode(token, phoneNumber, code) {
  return apiRequest(`/api/v1/buddy/join/${token}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      phone_number: phoneNumber,
      code,
    }),
  });
}
```

**IMPORTANT:** The exact endpoint paths above are my best guess based on reading `buddy.routes.js` patterns. Before implementing, open `backend/src/modules/buddy/buddy.routes.js` in Cursor and confirm the actual route paths. Adjust the paths in these files to match.

---

## Step 3 — Reusable QR Display Component

**File:** `src/components/ui/QRDisplay.jsx`

```jsx
import { QRCodeSVG } from 'qrcode.react';

export default function QRDisplay({ url, size = 200 }) {
  if (!url) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
```

Small and focused — styling context comes from the parent component.

---

## Step 4 — Invite Button + Modal on Itinerary Items

This is NOT a standalone page. It lives on your **existing ItineraryDetail page** as a button on each itinerary item. When tapped, it opens a modal with the QR code.

**File:** `src/components/InviteBuddyModal.jsx`

```jsx
import { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Share2, Clock, RefreshCw } from 'lucide-react';
import QRDisplay from './ui/QRDisplay';
import { createInvite, cancelInvite } from '../utils/buddyApi';

export default function InviteBuddyModal({ itineraryItem, onClose }) {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Generate invite on mount
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
      // Fallback
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
      // User cancelled — ignore
    }
  };

  // Time remaining on the token
  const getTimeRemaining = () => {
    if (!invite?.expires_at) return null;
    const diffMs = new Date(invite.expires_at) - new Date();
    if (diffMs <= 0) return 'Expired';
    const mins = Math.floor(diffMs / 60000);
    return `${mins}m remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Event info */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Invite a Buddy</h2>
          <p className="text-white/60 text-sm mt-1">{itineraryItem.title}</p>
          {itineraryItem.start_time && (
            <p className="text-white/40 text-xs mt-1">
              {new Date(itineraryItem.start_time).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
            <p className="text-white/50 text-sm">Generating invite...</p>
          </div>
        )}

        {/* QR code + actions */}
        {invite && !loading && (
          <div className="flex flex-col items-center gap-5">
            <QRDisplay url={invite.qr_url} size={180} />

            {/* Status info */}
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

            {/* Action buttons */}
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

              {navigator.share && (
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
            </div>

            {/* Cancel invite */}
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

        {/* Error */}
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
```

**Then, in your existing ItineraryDetail page,** add the invite trigger button to each itinerary item card. Find where items render and add:

```jsx
// At the top of the file, add imports:
import { useState } from 'react'; // if not already imported
import { Users } from 'lucide-react';
import InviteBuddyModal from '../components/InviteBuddyModal';

// Inside the component, add state:
const [inviteItem, setInviteItem] = useState(null);

// Inside each itinerary item card, add a button:
<button
  onClick={() => setInviteItem(item)}
  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all text-xs font-medium"
>
  <Users className="w-3.5 h-3.5" />
  Invite Buddy
</button>

// At the bottom of the component return, before closing </ImmersivePage>:
{inviteItem && (
  <InviteBuddyModal
    itineraryItem={inviteItem}
    onClose={() => setInviteItem(null)}
  />
)}
```

---

## Step 5 — Guest Join Page (Public, Multi-Step)

**File:** `src/pages/GuestJoin.jsx`  
**Route:** `/join/:token` (matches `buildQrUrl` in backend)

This is the most complex page — it's a 4-step flow:
1. **Loading** — validate the token
2. **Event preview** — show event details, host name, spots remaining
3. **Phone input** — guest enters phone + name, receives SMS code
4. **Code verify** — guest enters 6-digit code, link activates
5. **Success** — confirmation with event details

```jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2, MapPin, Clock, Users, Phone, ArrowRight,
  CheckCircle2, AlertCircle, PartyPopper, ShieldCheck,
} from 'lucide-react';
import { getInviteInfo, startVerification, confirmCode } from '../utils/guestApi';

export default function GuestJoin() {
  const { token } = useParams();
  const [step, setStep] = useState('loading'); // loading | preview | phone | verify | success | error | expired | full
  const [invite, setInvite] = useState(null);
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [guestId, setGuestId] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const codeInputRef = useRef(null);

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const data = await getInviteInfo(token);
      if (!data.valid) {
        if (data.reason === 'invite_expired') setStep('expired');
        else if (data.reason === 'party_full') setStep('full');
        else {
          setError(data.reason || 'Invalid invite');
          setStep('error');
        }
        return;
      }
      setInvite(data);
      setStep('preview');
    } catch (err) {
      setError(err.message || 'Failed to load invite');
      setStep('error');
    }
  };

  // Step 2 → 3: Guest clicks "Join" and enters phone
  const handlePhoneSubmit = async () => {
    if (!phone.trim() || !displayName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await startVerification(token, phone.trim(), displayName.trim());
      setGuestId(data.guest_id);
      setStep('verify');
      // Auto-focus code input after render
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 → 4: Guest submits SMS code
  const handleCodeSubmit = async () => {
    if (code.length !== 6) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await confirmCode(token, phone.trim(), code);
      setResult(data);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Verification failed');
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  // Format event time nicely
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full">

        {/* SoloWay branding — always visible */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">SoloWay</h1>
          <p className="text-white/40 text-xs mt-1">Travel Solo, Not Alone</p>
        </div>

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-white/40 animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Loading invite details...</p>
          </div>
        )}

        {/* ── PREVIEW — show event details before guest commits ── */}
        {step === 'preview' && invite && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3">
                <PartyPopper className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">You're invited!</h2>
              <p className="text-white/50 text-sm mt-1">
                {invite.host_name} wants you to join
              </p>
            </div>

            {/* Event card */}
            {invite.event && (
              <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/5">
                <h3 className="text-white font-semibold text-base">
                  {invite.event.title}
                </h3>
                {invite.event.description && (
                  <p className="text-white/50 text-sm mt-1">{invite.event.description}</p>
                )}
                <div className="flex flex-col gap-2 mt-3">
                  {invite.event.start_time && (
                    <span className="flex items-center gap-2 text-white/60 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(invite.event.start_time)}
                      {invite.event.end_time && ` – ${formatTime(invite.event.end_time)}`}
                    </span>
                  )}
                  {invite.event.location_name && (
                    <span className="flex items-center gap-2 text-white/60 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {invite.event.location_name}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-white/60 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {invite.spots_remaining} spot{invite.spots_remaining !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('phone')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-all"
            >
              Join this event
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── PHONE INPUT — guest enters phone + name ── */}
        {step === 'phone' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Quick verification</h2>
              <p className="text-white/50 text-sm mt-1">
                We'll text you a code to confirm — keeps everyone safe
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Your name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should they call you?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  autoComplete="tel"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handlePhoneSubmit}
                disabled={!phone.trim() || !displayName.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Send verification code
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep('preview')}
              className="block mx-auto mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* ── CODE VERIFY — guest enters 6-digit SMS code ── */}
        {step === 'verify' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Enter your code</h2>
              <p className="text-white/50 text-sm mt-1">
                We sent a 6-digit code to {phone}
              </p>
            </div>

            <div className="space-y-4">
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                autoFocus
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleCodeSubmit}
                disabled={code.length !== 6 || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Join
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-white/30 text-xs text-center mt-4">
              Code expires in 10 minutes. 3 attempts max.
            </p>

            <button
              onClick={() => { setStep('phone'); setCode(''); setError(null); }}
              className="block mx-auto mt-3 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Use a different number
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're in!</h2>
            <p className="text-white/60 text-sm mb-2">
              {result?.message || 'Have a great time!'}
            </p>
            {result?.event && (
              <div className="bg-white/5 rounded-xl p-4 mt-4 mb-6 border border-white/5 text-left">
                <h3 className="text-white font-semibold text-sm">{result.event.title}</h3>
                {result.event.location_name && (
                  <p className="flex items-center gap-1.5 text-white/50 text-xs mt-2">
                    <MapPin className="w-3 h-3" />
                    {result.event.location_name}
                  </p>
                )}
                {result.event.start_time && (
                  <p className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(result.event.start_time)}
                  </p>
                )}
              </div>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium"
            >
              Explore SoloWay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── EXPIRED ── */}
        {step === 'expired' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invite expired</h2>
            <p className="text-white/60 text-sm mb-6">
              This invite link has expired. Ask your friend to generate a new one from their itinerary.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium">
              Learn about SoloWay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── PARTY FULL ── */}
        {step === 'full' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
              <Users className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Party's full</h2>
            <p className="text-white/60 text-sm mb-6">
              This event has reached its party size limit. Better luck next time!
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium">
              Explore SoloWay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── GENERIC ERROR ── */}
        {step === 'error' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-white/60 text-sm mb-6">{error || 'Invalid invite link'}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium">
              Go to SoloWay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
```

---

## Step 6 — Buddy History Page

**File:** `src/pages/BuddyHistory.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImmersivePage from '../components/ImmersivePage';
import {
  Users, Clock, MapPin, Loader2, Plus,
  CheckCircle2, XCircle, UserPlus, ChevronRight,
} from 'lucide-react';
import { getUserHistory, requestConnection, respondToConnection, closeLink } from '../utils/buddyApi';

export default function BuddyHistory() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null); // null = all, or 'pending' | 'active' | 'expired'
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
      loadHistory(); // Refresh list
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
    <ImmersivePage>
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Filter tabs */}
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* History list */}
        {!loading && history && (
          <div className="space-y-3">
            {history.links.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No buddy invites yet</p>
                <p className="text-white/30 text-xs mt-1">
                  Open an itinerary item and tap "Invite Buddy" to get started
                </p>
              </div>
            ) : (
              history.links.map((link) => (
                <div
                  key={link.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4"
                >
                  {/* Top row: status + role + time */}
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

                  {/* Event info */}
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

                  {/* Guest info (if host) */}
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

                  {/* Actions based on status */}
                  <div className="flex gap-2">
                    {link.status === 'active' && (
                      <button
                        onClick={() => handleClose(link.id)}
                        className="px-3 py-1.5 text-xs text-white/50 border border-white/10 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        End early
                      </button>
                    )}
                    {link.status === 'expired' && link.role === 'host' && (
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

            {/* Pagination info */}
            {history.pagination.total_pages > 1 && (
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
```

---

## Step 7 — Route Wiring in App.jsx

Add these to `src/App.jsx`:

```jsx
// Imports — add at top:
import GuestJoin from './pages/GuestJoin';
import BuddyHistory from './pages/BuddyHistory';

// Inside <Routes>, add:

{/* Guest join — PUBLIC, no ProtectedRoute */}
<Route path="/join/:token" element={<GuestJoin />} />

{/* Buddy history — authenticated */}
<Route
  path="/buddy/history"
  element={
    <ProtectedRoute>
      <BuddyHistory />
    </ProtectedRoute>
  }
/>
```

**Note:** There is NO standalone `/buddy/share` route anymore. The invite creation happens via the `InviteBuddyModal` on the ItineraryDetail page. The "New Invite" button on BuddyHistory links to `/itineraries` where the user picks an item.

**Also note:** the guest route is `/join/:token` (matching `buildQrUrl` in the backend), NOT `/buddy/scan/:token` from the first guide.

---

## Step 8 — Navbar Link

In `src/components/Navbar.jsx`, add a link for authenticated users:

```jsx
{/* Add alongside existing authenticated links like "My Profile" */}
<Link
  to="/buddy/history"
  className="... (match your existing nav link classes)"
>
  Buddy History
</Link>
```

---

## Step 9 — Verification Checklist

```bash
# 1. Build check
npm run build

# 2. Dev server — watch for console errors
npm run dev
```

**Manual test flow:**

1. Sign in → go to an itinerary → open an item → tap "Invite Buddy" → QR modal appears
2. Copy the link → open in incognito (not signed in)
3. See event preview with host name, spots remaining
4. Enter name + phone → receive SMS code (in dev mode, check terminal for `[DEV SMS]` log)
5. Enter code → see "You're in!" with event details
6. Back in authenticated session → go to `/buddy/history` → see the invite with guest info
7. Test expired link, cancelled invite, and "party full" states

---

## File Summary

| Order | File | Type | Auth |
|-------|------|------|------|
| 1 | `src/utils/buddyApi.js` | Frontend API service | Mixed |
| 2 | `src/utils/guestApi.js` | Frontend API service | No |
| 3 | `src/components/ui/QRDisplay.jsx` | Reusable component | N/A |
| 4 | `src/components/InviteBuddyModal.jsx` | Modal component | Yes |
| 5 | Modifications to ItineraryDetail page | Button + modal trigger | Yes |
| 6 | `src/pages/GuestJoin.jsx` | Page (multi-step) | **No** |
| 7 | `src/pages/BuddyHistory.jsx` | Page | Yes |
| 8 | `src/App.jsx` | Route additions | — |
| 9 | `src/components/Navbar.jsx` | Nav link addition | — |

---

## IMPORTANT: Before You Start

Open `backend/src/modules/buddy/buddy.routes.js` in Cursor and confirm the exact endpoint paths. The `buddyApi.js` and `guestApi.js` files above use my best-guess paths based on the service method names. The actual mounted paths may differ. Cross-reference and adjust.

Also check if `src/utils/buddyService.js` and `src/utils/guestService.js` already exist from the last session. If they do, compare them to the `buddyApi.js` and `guestApi.js` above — you may be able to reuse or extend them rather than creating new files. Just make sure the method signatures and endpoint paths match the backend routes.
