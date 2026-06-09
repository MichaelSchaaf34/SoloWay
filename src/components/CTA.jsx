import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { joinWaitlist } from '../utils/waitlistService';

const CTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setStatus({ type: '', message: '' });
      const response = await joinWaitlist({ email });
      const data = response?.data || response;
      const message = data?.alreadyJoined
        ? 'You are already on the waitlist. We will keep you posted.'
        : "You're in. We'll send a heads-up when early access opens.";
      setStatus({ type: 'success', message });
      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Could not join waitlist. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="community" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="relative max-w-4xl mx-auto rounded-[32px] overflow-hidden noise-overlay shadow-[0_40px_80px_-30px_rgba(15,23,42,0.5)]">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.28),transparent_55%)]" />

          <div className="relative px-8 sm:px-12 lg:px-16 py-14 lg:py-20 text-white">
            {/* Social proof row */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex -space-x-2.5">
                {['from-teal-400 to-sky-500', 'from-rose-400 to-amber-400', 'from-indigo-400 to-purple-500', 'from-emerald-400 to-teal-500'].map((g, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-slate-900`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[12px] font-medium text-slate-300 tracking-wide">
                <span className="text-white font-semibold tabular-nums">10,000+</span> travelers on the waitlist
              </span>
            </div>

            <h2 className="text-balance text-center text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] mb-5 tracking-tight">
              Ready to travel on your own terms?
            </h2>
            <p className="text-pretty text-center text-slate-300 text-[17px] leading-relaxed max-w-xl mx-auto mb-9">
              Join the waitlist. The first 1,000 members get lifetime Pro access — on the house.
            </p>

            <form
              className="max-w-lg mx-auto flex flex-col sm:flex-row gap-2.5 sm:gap-2 p-1.5 sm:p-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="you@traveler.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3 rounded-full sm:rounded-full bg-transparent text-white placeholder:text-slate-400 text-[15px] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-[15px] hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting…' : (
                  <>
                    Get access
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {status.message && (
              <p
                className={`mt-5 text-center text-sm ${
                  status.type === 'error' ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {status.message}
              </p>
            )}

            <p className="mt-5 text-center text-[12px] text-slate-400">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
