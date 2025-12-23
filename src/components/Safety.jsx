import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

const Safety = () => {
  const safetyFeatures = [
    "Neighborhood safety heatmaps",
    "Automated 'I'm Safe' texts to trusted contacts",
    "Offline maps and emergency phrases"
  ];

  return (
    <section id="safety" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Left - Safety Card Demo */}
          <div className="flex-1">
            <div className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Guardian Active</h4>
                  <p className="text-xs text-slate-500">Monitoring neighborhood safety</p>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 mb-1 font-medium">Check-in scheduled</p>
                  <p className="text-xs text-slate-400">11:00 PM • "I'm safe back at the hostel"</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 opacity-50">
                  <p className="text-sm text-rose-600 mb-1 font-medium">Panic Mode</p>
                  <p className="text-xs text-rose-400">One tap alerts contacts + local services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Safety isn't an afterthought. <br/>It's the foundation.
            </h2>
            <p className="text-slate-500 text-lg mb-6 leading-relaxed">
              SoloWay doesn't just show you where to go—it tells you where to avoid. 
              Our "Guardian Agent" analyzes local crime data, lighting conditions, and crowd levels to route you safely.
            </p>
            <ul className="space-y-4">
              {safetyFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Safety;
