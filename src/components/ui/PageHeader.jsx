import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({
  eyebrow,
  title,
  description,
  backTo,
  backLabel = 'Back',
  actions,
  className = '',
}) => {
  return (
    <div className={['mb-8', className].filter(Boolean).join(' ')}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[15px] text-slate-500 max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
