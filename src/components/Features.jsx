import React from 'react';
import { MapPin, Shield, Users } from 'lucide-react';
import FeatureCard from './ui/FeatureCard';

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-900 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Solo Operating System</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            We replace the 10 tabs you usually have open with one intelligent interface that learns how you like to travel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={MapPin}
            title="Smart Itineraries"
            desc="Forward your confirmations. We build the timeline, fill the gaps with suggestions, and adapt when you change your mind."
            color="bg-teal-100"
          />
          <FeatureCard 
            icon={Shield}
            title="Safety Guardian"
            desc="Real-time neighborhood safety scores. Automated check-ins that text your mom so you don't have to."
            color="bg-rose-100"
          />
          <FeatureCard 
            icon={Users}
            title="Social Radar"
            desc="See other solo travelers on your route. Connect for a coffee or a museum, or stay invisible when you want peace."
            color="bg-indigo-100"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
