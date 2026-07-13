import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import useAuth from '../hooks/useAuth';

const navLinks = [
  { href: '/#destinations', label: 'Destinations' },
  { href: '/reviews',       label: 'Reviews'      },
  { href: '/#safety',       label: 'Safety'       },
  { href: '/#community',    label: 'Community'    },
];

// Hash links need a plain <a> to scroll landing sections; route links use
// react-router so navigation stays client-side.
const NavAnchor = ({ href, label, className, onClick }) =>
  href.startsWith('/#') ? (
    <a href={href} onClick={onClick} className={className}>{label}</a>
  ) : (
    <Link to={href} onClick={onClick} className={className}>{label}</Link>
  );

const initialsOf = (name = '', email = '') => {
  const source = (name || email.split('@')[0] || '').trim();
  if (!source) return 'S';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

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

  const displayName = user?.displayName || user?.email?.split('@')?.[0] || 'Account';
  const initials = initialsOf(user?.displayName, user?.email);

  const shellClass = scrolled
    ? 'border-slate-200/70 bg-white/80 shadow-[0_8px_30px_rgb(15,23,42,0.06)] backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-900/80'
    : 'border-white/70 bg-white/75 shadow-[0_8px_30px_rgb(15,23,42,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/45';

  const linkClass = scrolled
    ? 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    : 'text-slate-700 hover:text-slate-950 dark:text-white/85 dark:hover:text-white';

  const iconBtnClass = scrolled
    ? 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700'
    : 'bg-white/70 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-900/5 hover:bg-white dark:bg-white/10 dark:text-white/90 dark:ring-white/10 dark:hover:bg-white/20';

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className={`flex min-h-14 items-center justify-between rounded-2xl border px-3.5 sm:px-5 transition-[background-color,border-color,box-shadow] duration-300 ${shellClass}`}>
            {/* Brand + primary links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-1 ring-inset ring-white/20">
                  S
                </div>
                <span className="text-[17px] font-semibold tracking-tight text-slate-900 transition-colors dark:text-white">
                  SoloWay
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-7">
                {navLinks.map(l => (
                  <NavAnchor
                    key={l.href}
                    href={l.href}
                    label={l.label}
                    className={`text-sm font-medium transition-colors ${linkClass}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop right cluster */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors ${iconBtnClass}`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {isInitializing ? (
                <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full ${scrolled ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500' : 'bg-white/60 text-slate-500 dark:bg-white/10 dark:text-white/70'}`}>
                  Checking…
                </span>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/buddy/history"
                    className={`hidden xl:inline-block px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      scrolled
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-white/70 hover:text-slate-950 dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    Buddies
                  </Link>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-colors ${
                      scrolled
                        ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                        : 'bg-white text-slate-900 hover:bg-white/90'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center">
                      {initials}
                    </span>
                    <span className="text-sm font-semibold max-w-[8rem] truncate">{displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                      scrolled
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    scrolled
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  }`}
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile right cluster */}
            <div className="md:hidden flex items-center gap-1.5">
              {!isInitializing && isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  {initials}
                </Link>
              ) : (
                !isInitializing && (
                  <Link
                    to="/auth"
                    className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Sign in
                  </Link>
                )
              )}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors ${iconBtnClass}`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
              <button
                className={`p-2 rounded-xl transition-colors ${iconBtnClass}`}
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-1 text-lg font-medium text-slate-900 dark:text-slate-100">
            {navLinks.map(l => (
              <NavAnchor
                key={l.href}
                href={l.href}
                label={l.label}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-slate-200 dark:border-slate-800"
              />
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/buddy/history" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-slate-200 dark:border-slate-800">
                  Buddy history
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-6 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-center"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
