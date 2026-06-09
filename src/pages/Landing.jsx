import React from 'react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import Safety from '../components/Safety';
import FieldNotes from '../components/FieldNotes';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-900 font-sans text-slate-600 dark:text-slate-300">
      <Background />
      <Navbar />
      <Hero />
      <Destinations />
      <Safety />
      <FieldNotes />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
