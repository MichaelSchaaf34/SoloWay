import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Github } from 'lucide-react';

const COLUMNS = [
  {
    label: 'Product',
    links: [
      { href: '#destinations', label: 'Destinations' },
      { href: '#safety',       label: 'Safety' },
      { href: '#community',    label: 'Community' },
      { href: '/auth',         label: 'Sign in' },
    ],
  },
  {
    label: 'Company',
    links: [
      { href: '#', label: 'About' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Press' },
      { href: '#', label: 'Contact' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '#', label: 'Travel guides' },
      { href: '#', label: 'Safety center' },
      { href: '#', label: 'Help & FAQ' },
      { href: '#', label: 'Changelog' },
    ],
  },
];

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter,   href: '#', label: 'Twitter'   },
  { icon: Github,    href: '#', label: 'GitHub'    },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80">
      <div className="container mx-auto px-6 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-1 ring-inset ring-white/20">
                S
              </div>
              <span className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">SoloWay</span>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs mb-6">
              The intelligent companion for modern solo travelers. Travel solo, not alone.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.label}>
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase mb-4">
                {col.label}
              </div>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            © {year} SoloWay Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy#cookies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
