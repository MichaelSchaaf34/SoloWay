import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import FeaturedExperiences from '../components/FeaturedExperiences';
import Safety from '../components/Safety';
import FieldNotes from '../components/FieldNotes';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { millisecondsUntilNextLocalDay } from '../utils/destinationRotation';

const Landing = () => {
  const [rotationDate, setRotationDate] = useState(() => new Date());

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setRotationDate(new Date()),
      millisecondsUntilNextLocalDay(rotationDate) + 100
    );

    return () => window.clearTimeout(timeoutId);
  }, [rotationDate]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-900 font-sans text-slate-600 dark:text-slate-300">
      <Background />
      <Navbar />
      <Hero />
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
