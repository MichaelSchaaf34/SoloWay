import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2, MapPin, Clock, Users, Phone, ArrowRight,
  CheckCircle2, AlertCircle, PartyPopper, ShieldCheck,
} from 'lucide-react';
import { getInviteInfo, startVerification, confirmCode } from '../utils/guestService';

export default function GuestJoin() {
  const { token } = useParams();
  const [step, setStep] = useState('loading');
  const [invite, setInvite] = useState(null);
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const codeInputRef = useRef(null);

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

  const handlePhoneSubmit = async () => {
    if (!phone.trim() || !displayName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await startVerification(token, phone.trim(), displayName.trim());
      setStep('verify');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">SoloWay</h1>
          <p className="text-white/40 text-xs mt-1">Travel Solo, Not Alone</p>
        </div>

        {step === 'loading' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-white/40 animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Loading invite details...</p>
          </div>
        )}

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
              onClick={() => { setError(null); setStep('preview'); }}
              className="block mx-auto mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        )}

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
