import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, isInitializing, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const shortUserLabel = user?.displayName || user?.email?.split('@')?.[0] || 'Account';

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3' : 'bg-gradient-to-b from-black/30 to-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">S</div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white drop-shadow-md'}`}>SoloWay</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white drop-shadow-md'}`}>Features</a>
            <a href="#safety" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white drop-shadow-md'}`}>Safety</a>
            <a href="#community" className={`text-sm font-semibold transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white drop-shadow-md'}`}>Community</a>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${scrolled ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className={`w-5 h-5 ${scrolled ? 'text-slate-300' : 'text-white drop-shadow-md'}`} /> : <Moon className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-white drop-shadow-md'}`} />}
            </button>
            {isInitializing ? (
              <span className={`text-xs px-3 py-1 rounded-full border ${
                scrolled
                  ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  : 'text-white border-white/30'
              }`}>
                Checking session...
              </span>
            ) : isAuthenticated ? (
              <>
                <span className={`text-xs px-3 py-1 rounded-full border ${
                  scrolled
                    ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    : 'text-white border-white/30'
                }`}>
                  Signed in{user?.email ? `: ${user.email}` : ''}
                </span>
                <Link
                  to="/profile"
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                    scrolled
                      ? 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'border-white/50 text-white hover:bg-white/10'
                  }`}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <span className={`text-xs px-3 py-1 rounded-full border ${
                  scrolled
                    ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    : 'text-white border-white/30'
                }`}>
                  Signed out
                </span>
                <Link
                  to="/auth"
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign In / Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {!isInitializing && isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    scrolled
                      ? 'bg-slate-900 text-white dark:bg-teal-600'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {shortUserLabel}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    scrolled
                      ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      : 'text-white border-white/40'
                  }`}
                >
                  Log Out
                </button>
              </>
            )}
            {!isInitializing && !isAuthenticated && (
              <Link
                to="/auth"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  scrolled
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-white/20 text-white'
                }`}
              >
                Sign In
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${scrolled ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className={`w-5 h-5 ${scrolled ? 'text-slate-300' : 'text-white drop-shadow-md'}`} /> : <Moon className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-white drop-shadow-md'}`} />}
            </button>
            <button className={`${scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white drop-shadow-md'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
            <a href="#community" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl bg-teal-500 dark:bg-teal-600 text-white font-semibold text-center">
              Join Waitlist
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
