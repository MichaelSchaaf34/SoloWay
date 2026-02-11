import React from 'react';
import { Link } from 'react-router-dom';
import { ImmersivePage } from '../components';

const Explore = () => {
  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-16"
    >
      <section className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Explore SoloWay First</h1>
        <p className="text-slate-700 mt-4 max-w-2xl">See how planning, safety, and social features connect before you start building your trip.</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/itineraries" className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-center">Create My Trip Now</Link>
          <Link to="/start" className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-center">Back to First Choices</Link>
        </div>
      </section>
    </ImmersivePage>
  );
};

export default Explore;
