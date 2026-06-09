import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500',
  accent:
    'bg-teal-600 text-white hover:bg-teal-500 shadow-sm shadow-teal-500/20 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
  secondary:
    'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50',
  ghost:
    'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:text-slate-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-200 disabled:text-white',
  dangerGhost:
    'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-[15px] rounded-xl',
};

const Button = React.forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    type = 'button',
    iconLeft: IconLeft,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold tracking-tight ' +
    'transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed';

  const classes = [
    base,
    SIZES[size] || SIZES.md,
    VARIANTS[variant] || VARIANTS.primary,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;
  const extraProps = Component === 'button' ? { type, disabled: isDisabled } : {};

  return (
    <Component ref={ref} className={classes} aria-busy={loading || undefined} {...extraProps} {...rest}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        IconLeft && <IconLeft className="w-4 h-4" aria-hidden="true" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4" aria-hidden="true" />}
    </Component>
  );
});

export default Button;
