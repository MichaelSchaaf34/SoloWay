import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HeroSearchBar from '../components/HeroSearchBar';
import Destinations from '../components/Destinations';
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
    <div className="relative min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-900 font-sans text-slate-600 dark:text-slate-300">
      <Background />
      <Navbar />
      <Hero rotationDate={rotationDate} />
      <HeroSearchBar />
      <Destinations rotationDate={rotationDate} />
      <FeaturedExperiences rotationDate={rotationDate} />
      <Safety />
      <FieldNotes />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
