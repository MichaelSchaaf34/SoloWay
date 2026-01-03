import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3' : 'bg-gradient-to-b from-black/5 to-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">S</div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white drop-shadow-sm'}`}>SoloWay</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-white drop-shadow-sm'}`}>Features</a>
            <a href="#safety" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-white drop-shadow-sm'}`}>Safety</a>
            <a href="#community" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-white drop-shadow-sm'}`}>Community</a>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${scrolled ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className={`w-5 h-5 ${scrolled ? 'text-slate-300' : 'text-white drop-shadow-sm'}`} /> : <Moon className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-slate-900 drop-shadow-sm'}`} />}
            </button>
            <button className="px-5 py-2 rounded-full bg-slate-900 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-all hover:shadow-lg transform hover:-translate-y-0.5">
              Get Early Access
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${scrolled ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className={`w-5 h-5 ${scrolled ? 'text-slate-300' : 'text-white drop-shadow-sm'}`} /> : <Moon className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-slate-900 drop-shadow-sm'}`} />}
            </button>
            <button className={`${scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white drop-shadow-sm'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-24 px-6 md:hidden animate-in slide-in-from-top-10">
          <div className="flex flex-col gap-6 text-lg font-medium text-slate-800 dark:text-slate-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#safety" onClick={() => setMobileMenuOpen(false)}>Safety</a>
            <a href="#community" onClick={() => setMobileMenuOpen(false)}>Community</a>
            <hr className="border-slate-100 dark:border-slate-700" />
            <button className="w-full py-3 rounded-xl bg-teal-500 dark:bg-teal-600 text-white font-semibold">Join Waitlist</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
