import React from 'react';

export const Skeleton = ({ className = '', ...rest }) => (
  <div
    className={[
      'animate-pulse rounded-lg bg-slate-200/80',
      className,
    ].filter(Boolean).join(' ')}
    aria-hidden="true"
    {...rest}
  />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={['space-y-2', className].filter(Boolean).join(' ')} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-3 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    role="status"
    aria-label="Loading"
  >
    <Skeleton className="h-5 w-2/3" />
    <div className="mt-3 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
    <Skeleton className="mt-5 h-6 w-20 rounded-lg" />
  </div>
);

const LoadingSkeleton = ({ count = 3, className = '' }) => (
  <div className={['grid gap-4 md:grid-cols-2', className].filter(Boolean).join(' ')}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingSkeleton;
