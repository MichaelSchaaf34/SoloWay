import React, { useState } from 'react';
import { Coffee, MapPin, Shield, Users, ChevronRight, CheckCircle } from 'lucide-react';
import ItineraryItem from './ItineraryItem';

const Hero = () => {
  const [tripMood, setTripMood] = useState('chill');

  return (
    <header className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Web Beta Open</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Travel Solo, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">Not Alone.</span>
            </h1>
            
            <p className="text-lg text-slate-700 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The first intelligent travel companion built for the modern solo explorer. 
              Curated itineraries, real-time safety checks, and a community that keeps its distance until you say otherwise.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200/50">
                Start Your Journey
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                Watch Demo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> Free forever plan</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> No ads</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> Privacy first</span>
            </div>
          </div>

          {/* Right Visual: The "App" Interface */}
          <div className="flex-1 w-full max-w-md lg:max-w-full relative">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            {/* Main Card */}
            <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden p-6">
              
              {/* App Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Kyoto, Japan</h3>
                  <p className="text-xs text-slate-500">Oct 12 - Oct 19 • Solo Trip</p>
                </div>
                <div className="flex gap-2">
                  <div 
                    className={`p-2 rounded-lg cursor-pointer transition-all ${tripMood === 'chill' ? 'bg-teal-100 text-teal-700' : 'bg-transparent text-slate-400'}`} 
                    onClick={() => setTripMood('chill')}
                  >
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div 
                    className={`p-2 rounded-lg cursor-pointer transition-all ${tripMood === 'adventure' ? 'bg-rose-100 text-rose-700' : 'bg-transparent text-slate-400'}`} 
                    onClick={() => setTripMood('adventure')}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Dynamic Itinerary */}
              <div className="space-y-0 bg-white/50 rounded-2xl p-6 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-800">Today's Vibe: {tripMood === 'chill' ? 'Slow & Steady' : 'Full Exploration'}</h4>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Safe Area
                  </span>
                </div>
                
                {tripMood === 'chill' ? (
                  <>
                    <ItineraryItem time="09:00 AM" title="Coffee at Weekenders" type="relax" mood={tripMood} />
                    <ItineraryItem time="11:30 AM" title="Stroll Philosopher's Path" type="relax" mood={tripMood} />
                    <ItineraryItem time="02:00 PM" title="Reading at Kamo River" type="relax" mood={tripMood} />
                  </>
                ) : (
                  <>
                    <ItineraryItem time="08:00 AM" title="Hike Fushimi Inari" type="active" mood={tripMood} />
                    <ItineraryItem time="12:30 PM" title="Street Food Market" type="food" mood={tripMood} />
                    <ItineraryItem time="04:00 PM" title="Gion Geisha District Tour" type="active" mood={tripMood} />
                  </>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">SoloWay Radar</p>
                      <p className="text-sm font-medium text-slate-700">2 other travelers nearby</p>
                    </div>
                    <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:text-indigo-600">Connect</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
