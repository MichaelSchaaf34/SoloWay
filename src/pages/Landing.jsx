import React from 'react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Safety from '../components/Safety';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 selection:bg-teal-100">
      <Background />
      <Navbar />
      <Hero />
      <Features />
      <Safety />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
