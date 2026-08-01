import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, X } from 'lucide-react';
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

const PreviewNav = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Link to="/preview/home" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pv-accent)] text-sm font-bold text-white">
              S
            </span>
            <span className="text-[17px] font-bold tracking-tight text-[var(--pv-ink)]">
              SoloWay
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map(link => (
              <NavItem
                key={link.label}
                {...link}
                className="text-[13.5px] font-medium text-slate-500 transition-colors hover:text-[var(--pv-ink)]"
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Theme"
          >
            <Sun className="h-4 w-4" />
          </button>
          <span className="hidden text-xs font-semibold text-slate-500 sm:inline">EN</span>
          <Link
            to={isAuthenticated ? '/profile' : '/auth'}
            className="ml-1 rounded-xl bg-[var(--pv-ink)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1f2440]"
          >
            {isAuthenticated ? 'Account' : 'Sign in'}
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 lg:hidden"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map(link => (
              <NavItem
                key={link.label}
                {...link}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-700"
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default PreviewNav;
