import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import useAuth from '../../hooks/useAuth';

const LINKS = [
  { href: '/explore', label: 'Explore' },
  { href: '/#destinations', label: 'Destinations' },
  { href: '/#destinations', label: 'Events' },
  { href: '/reviews', label: 'Stories' },
  { href: '/#safety', label: 'Safety' },
  { href: '/#community', label: 'Community' },
];

const NavItem = ({ href, label, onClick, className }) =>
  href.startsWith('/#') ? (
    <a href={href} onClick={onClick} className={className}>
      {label}
    </a>
  ) : (
    <Link to={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );

const HomeNav = () => {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0f1220]/95">
      <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sw-accent)] text-sm font-bold text-white">
              S
            </span>
            <span className="text-[17px] font-bold tracking-tight text-[var(--sw-ink)] dark:text-white">
              SoloWay
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map(link => (
              <NavItem
                key={link.label}
                {...link}
                className="text-[14px] font-medium text-slate-500 transition-colors hover:text-[var(--sw-ink)] dark:text-slate-300 dark:hover:text-white"
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <span className="hidden text-xs font-semibold text-slate-500 dark:text-slate-400 sm:inline">
            EN
          </span>
          <Link
            to={isAuthenticated ? '/profile' : '/auth'}
            className="ml-1 rounded-xl bg-[var(--sw-ink)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1f2440] dark:bg-white dark:text-[var(--sw-ink)] dark:hover:bg-slate-100"
          >
            {isAuthenticated ? 'Account' : 'Sign in'}
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 lg:hidden"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800 lg:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map(link => (
              <NavItem
                key={link.label}
                {...link}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNav;
