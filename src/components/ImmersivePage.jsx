import React, { useState } from 'react';

const ImmersivePage = ({
  children,
  imageUrl,
  imagePosition = 'center',
  tone = 'light',
  mainClassName = '',
  contentClassName = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const isLightTone = tone === 'light';

  return (
    <main className={`relative min-h-screen overflow-hidden ${isLightTone ? 'text-slate-900' : 'text-slate-100'} ${mainClassName}`}>
      <div className="absolute inset-0">
        {!imageFailed && (
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            style={{ objectPosition: imagePosition }}
            onError={() => setImageFailed(true)}
          />
        )}
        <div className={`absolute inset-0 ${isLightTone ? 'bg-white/22' : 'bg-slate-950/70'}`} />
        <div
          className={`absolute inset-0 ${isLightTone
            ? 'bg-gradient-to-b from-white/30 via-white/10 to-slate-100/32'
            : 'bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/85'
          }`}
        />
        <div className={`pointer-events-none absolute -top-32 -left-12 h-72 w-72 rounded-full blur-3xl ${isLightTone ? 'bg-teal-300/14' : 'bg-teal-400/20'}`} />
        <div className={`pointer-events-none absolute -bottom-20 -right-8 h-80 w-80 rounded-full blur-3xl ${isLightTone ? 'bg-sky-300/14' : 'bg-sky-400/20'}`} />
      </div>
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </main>
  );
};

export default ImmersivePage;
