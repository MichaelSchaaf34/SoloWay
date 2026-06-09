import React from 'react';

const baseInputClasses =
  'w-full h-11 px-3.5 rounded-xl border bg-white text-slate-900 text-sm placeholder:text-slate-400 ' +
  'transition-colors outline-none ' +
  'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 ' +
  'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

const errorBorder = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20';
const normalBorder = 'border-slate-200 hover:border-slate-300';

const Input = React.forwardRef(function Input(
  { error = false, className = '', type = 'text', ...rest },
  ref
) {
  const classes = [
    baseInputClasses,
    error ? errorBorder : normalBorder,
    className,
  ].filter(Boolean).join(' ');

  return <input ref={ref} type={type} className={classes} aria-invalid={error || undefined} {...rest} />;
});

export default Input;
