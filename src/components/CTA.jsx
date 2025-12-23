import React, { useState } from 'react';

const CTA = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement waitlist signup
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          
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
              className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-teal-50 transition-colors"
            >
              Get Access
            </button>
          </form>
          
          <p className="mt-4 text-xs text-slate-400 relative z-10">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
