import React, { useEffect } from 'react';
import PreviewNav from '../components/landing-preview/PreviewNav';
import PreviewHero from '../components/landing-preview/PreviewHero';
import PreviewInspiration from '../components/landing-preview/PreviewInspiration';
import PreviewFeatures from '../components/landing-preview/PreviewFeatures';
import Footer from '../components/Footer';

/**
 * Visual-only home redesign preview replicating the approved mock 1:1.
 * Live site stays at `/`. Open at `/preview/home` to compare before promoting.
 * Intentionally light-only: the mock is a light design, so this page ignores
 * the app theme to guarantee it always renders exactly like the snapshot.
 */
const LandingPreview = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = 'SoloWay home preview | Design preview';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-white font-sans text-slate-600"
      style={{
        '--pv-ink': '#14182B',
        '--pv-accent': '#6C70F2',
      }}
    >
      <PreviewNav />
      <main>
        <PreviewHero />
        <PreviewInspiration />
        <PreviewFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPreview;
