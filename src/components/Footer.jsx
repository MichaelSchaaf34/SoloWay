import React from 'react';
import { Camera, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-teal-400 to-indigo-400 rounded-md flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="text-lg font-bold text-slate-700">SoloWay</span>
        </div>
        <div className="text-slate-400 text-sm">
          © 2025 SoloWay Inc. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Camera className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Heart className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
