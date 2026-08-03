import React, { useEffect, useState } from 'react';
import PreviewNav from '../components/landing-preview/PreviewNav';
import PreviewHero from '../components/landing-preview/PreviewHero';
import PreviewInspiration from '../components/landing-preview/PreviewInspiration';
import PreviewFeatures from '../components/landing-preview/PreviewFeatures';
import FeaturedExperiences from '../components/FeaturedExperiences';
import Safety from '../components/Safety';
import FieldNotes from '../components/FieldNotes';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { millisecondsUntilNextRotation } from '../utils/destinationRotation';

/**
 * Full home redesign preview: new hero/search/inspiration design on top,
 * followed by the live homepage's remaining sections. Live site stays at `/`.
 * Open at `/preview/home` to compare before promoting.
 */
const LandingPreview = () => {
  const [rotationDate, setRotationDate] = useState(() => new Date());

  useEffect(() => {
    const previous = document.title;
    document.title = 'SoloWay home preview | Design preview';
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const refresh = () => setRotationDate(new Date());
    const timeoutId = window.setTimeout(
      refresh,
      millisecondsUntilNextRotation(rotationDate) + 100
    );
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [rotationDate]);

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
        <PreviewInspiration rotationDate={rotationDate} />
        <PreviewFeatures />
        <FeaturedExperiences rotationDate={rotationDate} />
        <Safety />
        <FieldNotes />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPreview;
