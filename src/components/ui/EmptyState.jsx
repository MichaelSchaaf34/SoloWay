import React from 'react';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={[
        'text-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 bg-white/60',
        className,
      ].filter(Boolean).join(' ')}
    >
      {Icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mb-4">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
