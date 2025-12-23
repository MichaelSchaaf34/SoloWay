import React from 'react';
import Badge from './ui/Badge';

const ItineraryItem = ({ time, title, type, mood }) => {
  const isActive = (mood === 'adventure' && type === 'active') || (mood === 'chill' && type === 'relax');
  
  return (
    <div className={`relative pl-8 pb-8 border-l-2 ${isActive ? 'border-teal-400' : 'border-slate-100'} last:pb-0 transition-all duration-500`}>
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isActive ? 'bg-white border-teal-400' : 'bg-slate-50 border-slate-200'}`}></div>
      <span className="text-xs font-medium text-slate-400 mb-1 block">{time}</span>
      <h4 className="text-md font-semibold text-slate-700">{title}</h4>
      <div className="flex gap-2 mt-2">
        {type === 'active' && <Badge color="rose">Adventure</Badge>}
        {type === 'relax' && <Badge color="teal">Chill</Badge>}
        {type === 'food' && <Badge color="indigo">Local Eats</Badge>}
      </div>
    </div>
  );
};

export default ItineraryItem;
