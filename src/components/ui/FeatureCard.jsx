import React from 'react';

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-xl ${color} dark:opacity-80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default FeatureCard;
