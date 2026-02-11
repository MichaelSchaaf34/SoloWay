import React from 'react';

const Background = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-[600px] md:h-[750px] bg-slate-950 overflow-hidden z-0">
      {/* Billowy Clouds Image Layer - 100% CLOUDS, NO MOUNTAINS */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2500&auto=format&fit=crop" 
          alt="Billowy Clouds" 
          className="w-full h-full object-cover object-right scale-125 opacity-100 brightness-110 contrast-110"
        />
      </div>

      {/* Atmospheric Gradients - Lightened to make it brighter */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/20 via-transparent to-white/20 dark:from-slate-950/40 dark:to-slate-950/10"></div>

      {/* Sky Blue Glow Blob - Brighter to pop more */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[500px] bg-sky-400/30 rounded-full blur-[150px] pointer-events-none opacity-60"></div>

      {/* Bottom Transition Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-[#020617] to-transparent z-30"></div>
    </div>
  );
};

export default Background;
