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

      {/* Gentle wash to help text contrast without killing the photo */}
      <div className="absolute inset-0 z-10 bg-white/25 dark:bg-slate-950/55"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/30 via-white/5 to-slate-50/20 dark:from-slate-950/50 dark:via-slate-950/30 dark:to-slate-950/20"></div>

      {/* Ambient colored blurs */}
      <div className="pointer-events-none absolute -top-32 -left-12 h-72 w-72 rounded-full blur-3xl bg-teal-300/15 z-10"></div>
      <div className="pointer-events-none absolute -bottom-32 -right-8 h-96 w-96 rounded-full blur-3xl bg-indigo-300/15 z-10"></div>

      {/* Smooth transition into the Features section (which is bg-slate-50) */}
      <div className="absolute bottom-0 left-0 w-full h-60 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 z-30"></div>
    </div>
  );
};

export default Background;
