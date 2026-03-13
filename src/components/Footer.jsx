import React from 'react';
import { Camera, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-tr from-teal-400 to-indigo-400 rounded-md flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300">SoloWay</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Features</a>
          <a href="#safety" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Safety</a>
          <a href="#community" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Community</a>
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-sm whitespace-nowrap">
          © 2025 SoloWay Inc. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="#" aria-label="SoloWay photos" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Camera className="w-5 h-5" />
          </a>
          <a href="#" aria-label="SoloWay likes" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Heart className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
