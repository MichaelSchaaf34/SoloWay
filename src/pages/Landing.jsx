import React, { useEffect, useState } from 'react';
import HomeNav from '../components/home/HomeNav';
import HomeHero from '../components/home/HomeHero';
import HomeInspiration from '../components/home/HomeInspiration';
import HomeFeatures from '../components/home/HomeFeatures';
import FeaturedExperiences from '../components/FeaturedExperiences';
import Safety from '../components/Safety';
import FieldNotes from '../components/FieldNotes';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { millisecondsUntilNextRotation } from '../utils/destinationRotation';

const Landing = () => {
  const [rotationDate, setRotationDate] = useState(() => new Date());

  useEffect(() => {
    const refreshRotation = () => setRotationDate(new Date());

    // Re-render at 12am Eastern so an open tab picks up the day's rotation.
    const timeoutId = window.setTimeout(
      refreshRotation,
      millisecondsUntilNextRotation(rotationDate) + 100
    );

    // Background tabs may throttle long timers — catch up on focus.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshRotation();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [rotationDate]);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-white font-sans text-slate-600 dark:bg-[#0f1220] dark:text-slate-300"
      style={{
        '--sw-ink': '#14182B',
        '--sw-accent': '#6C70F2',
      }}
    >
      <HomeNav />
      <main>
        <HomeHero />
        <HomeInspiration rotationDate={rotationDate} />
        <HomeFeatures />
        <FeaturedExperiences rotationDate={rotationDate} />
        <Safety />
        <FieldNotes />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
