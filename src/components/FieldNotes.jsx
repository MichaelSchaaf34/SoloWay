import React from 'react';

const CATEGORY_STYLES = {
  LOGISTICS: 'text-teal-300 bg-teal-500/10 ring-teal-400/20',
  SOCIAL:    'text-indigo-300 bg-indigo-500/10 ring-indigo-400/20',
  MONEY:     'text-amber-300 bg-amber-500/10 ring-amber-400/20',
  SAFETY:    'text-rose-300 bg-rose-500/10 ring-rose-400/20',
  MINDSET:   'text-emerald-300 bg-emerald-500/10 ring-emerald-400/20',
  PACKING:   'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-400/20',
};

const NOTES = [
  {
    category: 'LOGISTICS',
    title: 'Book First Two Nights',
    desc: 'Pre-book accommodation for your first two nights — arriving jet-lagged and decision-free is a gift to future-you. Then stay flexible.',
  },
  {
    category: 'SOCIAL',
    title: 'Eat At The Bar',
    desc: 'Bar seats and communal tables kill the solo-dining awkwardness and open organic conversations with bartenders, chefs, and locals.',
  },
  {
    category: 'MONEY',
    title: 'Two Payment Stashes',
    desc: "Split cash and cards across two bags so one theft can't strand you. Keep emergency USD/EUR hidden in your main luggage.",
  },
  {
    category: 'SAFETY',
    title: 'Share Live Location Daily',
    desc: 'Send your address and next-day plan to one trusted person every morning. A simple check-in beats any expensive tracker.',
  },
  {
    category: 'LOGISTICS',
    title: 'Download Maps Offline',
    desc: "Google Maps' offline mode saves trips when roaming dies, wifi fails, or you're deep on a 12-hour overnight bus.",
  },
  {
    category: 'MINDSET',
    title: 'The Two-Question Rule',
    desc: 'When invited anywhere, ask yourself: is it safe, and will I remember it? If both answers are yes, go.',
  },
  {
    category: 'PACKING',
    title: 'Pack One Week Max',
    desc: 'Laundromats exist everywhere. Every extra kilo you carry compounds on every flight, train, and cobblestone.',
  },
  {
    category: 'SOCIAL',
    title: 'Learn Ten Local Phrases',
    desc: 'Hello, thanks, water, bathroom, left / right, check please, sorry, beautiful, delicious. People open up immediately.',
  },
];

const FieldNotes = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-[120px] bg-indigo-500/10" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full blur-[120px] bg-teal-500/10" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 lg:mb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/15 text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70 mb-6">
              Field notes
            </span>
            <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-tight">
              Eight things<br />
              you'll wish you{' '}
              <span className="font-serif-italic bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                knew sooner
              </span>
              <span className="text-white">.</span>
            </h2>
          </div>
          <p className="lg:max-w-sm text-pretty text-[15px] leading-relaxed text-slate-400">
            Distilled from thousands of solo travelers on r/solotravel, veteran bloggers, and the SoloWay community. Less cliché, more signal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {NOTES.map((note, i) => {
            const cat = CATEGORY_STYLES[note.category] || CATEGORY_STYLES.LOGISTICS;
            return (
              <article
                key={note.title}
                className="relative rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 group overflow-hidden"
              >
                <span className="absolute top-4 right-5 text-[11px] font-semibold tracking-[0.2em] text-white/25 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className={`inline-flex items-center px-2 py-0.5 mb-5 rounded-full text-[10px] font-semibold tracking-[0.2em] ring-1 ring-inset ${cat}`}>
                  {note.category}
                </span>

                <h3 className="text-[16px] font-semibold text-white mb-2.5 tracking-tight leading-snug">
                  {note.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-400">
                  {note.desc}
                </p>

                {/* Subtle hover underline accent */}
                <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FieldNotes;
