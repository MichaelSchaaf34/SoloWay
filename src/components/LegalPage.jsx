import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const LegalPage = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300">
      <header className="border-b border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold tracking-tight"
          >
            <span
              className="inline-block w-7 h-7 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #818cf8 100%)' }}
              aria-hidden="true"
            />
            SoloWay
          </Link>
          <Link
            to="/"
            className="text-sm text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 lg:py-24">
        <article className="max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400 mb-3">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-3 text-sm text-slate-500 dark:text-white/50">
              Last updated {lastUpdated}
            </p>
          )}

          <div className="legal-prose mt-10">{children}</div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;
