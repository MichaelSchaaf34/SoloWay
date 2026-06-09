import React from 'react';
import { ChevronDown } from 'lucide-react';

const baseSelectClasses =
  'appearance-none w-full h-11 pl-3.5 pr-9 rounded-xl border bg-white text-slate-900 text-sm ' +
  'transition-colors outline-none cursor-pointer ' +
  'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 ' +
  'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

const errorBorder = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20';
const normalBorder = 'border-slate-200 hover:border-slate-300';

const Select = React.forwardRef(function Select(
  { error = false, className = '', children, ...rest },
  ref
) {
  const classes = [
    baseSelectClasses,
    error ? errorBorder : normalBorder,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="relative">
      <select ref={ref} className={classes} aria-invalid={error || undefined} {...rest}>
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

export default Select;
