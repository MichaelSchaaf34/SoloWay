import { Loader2 } from 'lucide-react';

export function formatMoney(cents, currency = 'usd') {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
  });
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_STYLES = {
  paid: 'bg-emerald-400/15 text-emerald-300',
  fulfilled: 'bg-emerald-400/15 text-emerald-300',
  active: 'bg-emerald-400/15 text-emerald-300',
  pending: 'bg-amber-400/15 text-amber-300',
  processing: 'bg-amber-400/15 text-amber-300',
  restricted: 'bg-amber-400/15 text-amber-300',
  payment_failed: 'bg-red-400/15 text-red-300',
  cancelled: 'bg-red-400/15 text-red-300',
  disputed: 'bg-red-400/15 text-red-300',
  disabled: 'bg-red-400/15 text-red-300',
  refunded: 'bg-sky-400/15 text-sky-300',
  partially_refunded: 'bg-sky-400/15 text-sky-300',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-white/10 text-white/60';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {String(status).replace(/_/g, ' ')}
    </span>
  );
}

export function AdminCard({ title, actions, children, className = '' }) {
  return (
    <section className={`bg-white/5 border border-white/10 rounded-2xl ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function AdminTable({ columns, rows, renderRow, emptyMessage = 'Nothing here yet.' }) {
  if (!rows.length) {
    return <p className="px-5 py-8 text-sm text-white/40 text-center">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-white/40">
            {columns.map(column => (
              <th key={column} className="px-5 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {rows.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ offset, limit, total, onChange }) {
  if (total <= limit) return null;
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 text-sm text-white/60">
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(offset + limit)}
          disabled={offset + limit >= total}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16 text-white/40">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

export function ErrorBlock({ message }) {
  return (
    <p className="px-5 py-4 text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl">
      {message}
    </p>
  );
}
