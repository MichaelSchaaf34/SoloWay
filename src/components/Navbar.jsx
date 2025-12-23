import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">SoloWay</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-teal-600 transition-colors">Features</a>
            <a href="#safety" className="text-sm font-medium hover:text-teal-600 transition-colors">Safety</a>
            <a href="#community" className="text-sm font-medium hover:text-teal-600 transition-colors">Community</a>
            <button className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5">
              Get Early Access
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in slide-in-from-top-10">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#safety" onClick={() => setMobileMenuOpen(false)}>Safety</a>
            <a href="#community" onClick={() => setMobileMenuOpen(false)}>Community</a>
            <hr className="border-slate-100" />
            <button className="w-full py-3 rounded-xl bg-teal-500 text-white font-semibold">Join Waitlist</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
