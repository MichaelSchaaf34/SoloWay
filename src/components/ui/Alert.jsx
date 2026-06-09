import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const TONES = {
  error: {
    wrapper: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
  },
  success: {
    wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  info: {
    wrapper: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: Info,
    iconColor: 'text-sky-500',
  },
};

const Alert = ({ tone = 'info', title, children, className = '' }) => {
  const { wrapper, icon: Icon, iconColor } = TONES[tone] || TONES.info;

  return (
    <div
      role="alert"
      className={['rounded-xl border px-4 py-3 text-sm flex gap-3', wrapper, className]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon className={['w-4 h-4 mt-0.5 flex-shrink-0', iconColor].join(' ')} aria-hidden="true" />
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
};

export default Alert;
