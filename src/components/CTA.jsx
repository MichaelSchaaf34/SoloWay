import React, { useState } from 'react';
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
        : 'Success! You are on the waitlist.';
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
    <section id="community" className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 dark:from-teal-900 dark:to-slate-900 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
            Ready to travel on your own terms?
          </h2>
          <p className="text-slate-300 mb-8 text-lg relative z-10">
            Join 10,000+ travelers on the waitlist. First 1,000 get lifetime Pro access.
          </p>
          
          <form 
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 relative z-10" 
            onSubmit={handleSubmit}
          >
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-teal-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Get Access'}
            </button>
          </form>

          {status.message && (
            <p
              className={`mt-4 text-sm relative z-10 ${
                status.type === 'error' ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {status.message}
            </p>
          )}
          
          <p className="mt-4 text-xs text-slate-400 relative z-10">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
