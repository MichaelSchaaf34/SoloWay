import React from 'react';

const Background = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-[920px] sm:h-[980px] lg:h-[1080px] overflow-hidden z-0">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2500&auto=format&fit=crop" 
          alt="" 
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-white/22"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/30 via-white/10 to-slate-100/32"></div>

      <div className="pointer-events-none absolute -top-32 -left-12 h-72 w-72 rounded-full blur-3xl bg-teal-300/14 z-10"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-8 h-80 w-80 rounded-full blur-3xl bg-sky-300/14 z-10"></div>

      <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-slate-100 dark:from-[#020617] to-transparent z-30"></div>
    </div>
  );
};

export default Background;
