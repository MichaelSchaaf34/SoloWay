import React from 'react';

const Background = () => {
  return (
    <>
      {/* Main Header Background Container 
        This container holds the orange/sky gradient overlay.
        The photorealistic cloud image sits inside it, underneath the gradient.
      */}
      <div className="absolute top-0 left-0 w-full h-[500px] sm:h-[600px] bg-gradient-to-b from-orange-50/10 via-sky-50/5 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 z-0 overflow-hidden">
        
        {/* REPLACED SVG WITH PHOTOREALISTIC IMAGE 
           I used an Unsplash URL that matches the look you want. 
           Replace the 'src' below with your actual local image path if you have one.
        */}
        <img 
          src="https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Cloud background texture"
          /* className explanation:
             - absolute inset-0 w-full h-full object-cover: Makes the image fill the container perfectly without distortion.
             - -z-10: Ensures it sits BEHIND the gradient defined in the parent div.
             - opacity-20: Faded more to prevent the background from feeling gray.
          */
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-20 dark:opacity-20 grayscale-0 mix-blend-multiply dark:mix-blend-overlay"
        />

      </div>

      {/* Ambient Gradients (Kept these as they add nice extra color depth) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-50 dark:bg-sky-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 dark:opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-teal-50 dark:bg-teal-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-50 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 dark:opacity-30"></div>
      </div>
    </>
  );
};

export default Background;
