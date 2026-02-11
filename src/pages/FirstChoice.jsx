import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ImmersivePage } from '../components';

const FirstChoice = () => {
  const { user } = useAuth();

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-16"
    >
      <section className="max-w-5xl mx-auto">
        <p className="text-teal-700 text-sm uppercase tracking-wide font-semibold">
          Welcome{user?.displayName ? `, ${user.displayName}` : ''}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">Where do you want to go?</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Create My Trip</h2>
            <p className="text-slate-700 mt-3">Start with destination, dates, and vibe.</p>
            <Link to="/itineraries" className="mt-6 inline-block px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 font-semibold text-white">Start Planning</Link>
          </article>
          <article className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Explore First</h2>
            <p className="text-slate-700 mt-3">Browse app concepts and come back when ready.</p>
            <Link to="/explore" className="mt-6 inline-block px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700">Explore</Link>
          </article>
        </div>
      </section>
    </ImmersivePage>
  );
};

export default FirstChoice;
