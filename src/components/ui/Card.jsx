import React from 'react';

const TONES = {
  base: 'bg-white border-slate-200',
  glass: 'bg-white/85 border-white/80 backdrop-blur-md',
  muted: 'bg-slate-50 border-slate-200',
};

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
};

const SHADOW = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md shadow-slate-900/5',
  lg: 'shadow-xl shadow-slate-900/5',
};

const Card = React.forwardRef(function Card(
  {
    as: Component = 'div',
    tone = 'base',
    padding = 'lg',
    shadow = 'md',
    interactive = false,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'rounded-2xl border',
    TONES[tone] || TONES.base,
    PADDING[padding] ?? PADDING.lg,
    SHADOW[shadow] ?? SHADOW.md,
    interactive ? 'transition-all hover:shadow-lg hover:-translate-y-0.5' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component ref={ref} className={classes} {...rest}>
      {children}
    </Component>
  );
});

export default Card;
