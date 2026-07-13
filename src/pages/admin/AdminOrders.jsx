import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { listOrders, getOrderDetail, refundOrder } from '../../utils/adminService';
import {
  AdminCard, AdminTable, Pager, LoadingBlock, ErrorBlock,
  StatusBadge, formatDate, formatDateTime, formatMoney,
} from './adminUi';

const LIMIT = 25;
const STATUSES = [
  'pending', 'processing', 'paid', 'fulfilled', 'payment_failed',
  'cancelled', 'partially_refunded', 'refunded', 'disputed',
];

function OrderDetailPanel({ orderId, onClose, onRefunded }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    setOrder(null);
    getOrderDetail(orderId).then(setOrder).catch(err => setError(err.message));
  }, [orderId]);

  const canRefund = order && ['paid', 'fulfilled'].includes(order.status);

  const handleRefund = async () => {
    if (!window.confirm(`Issue a full refund of ${formatMoney(order.totalCents, order.currency)} for ${order.reference}?`)) return;
    setRefunding(true);
    try {
      await refundOrder(orderId, refundReason);
      onRefunded();
      const updated = await getOrderDetail(orderId);
      setOrder(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <AdminCard
      title="Order detail"
      actions={
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      }
    >
      {error && <div className="p-4"><ErrorBlock message={error} /></div>}
      {!order && !error && <LoadingBlock />}
      {order && (
        <div className="p-5 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{order.reference}</p>
              <p className="text-white/60">{order.userEmail}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-white/60">
            <div><dt className="text-white/40 text-xs">Destination</dt><dd>{order.destination}</dd></div>
            <div><dt className="text-white/40 text-xs">Provider</dt><dd>{order.providerName}</dd></div>
            <div><dt className="text-white/40 text-xs">Trip dates</dt><dd>{formatDate(order.tripStartDate)} – {formatDate(order.tripEndDate)}</dd></div>
            <div><dt className="text-white/40 text-xs">Paid at</dt><dd>{formatDateTime(order.paidAt)}</dd></div>
            <div><dt className="text-white/40 text-xs">Total</dt><dd>{formatMoney(order.totalCents, order.currency)}</dd></div>
            <div><dt className="text-white/40 text-xs">Commission</dt><dd>{formatMoney(order.commissionCents, order.currency)}</dd></div>
          </dl>

          <div>
            <p className="text-white/40 text-xs mb-2">Items</p>
            <ul className="space-y-2">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                  <span className="truncate">{item.title} · {formatDate(item.scheduledDate)}</span>
                  <span className="shrink-0">{formatMoney(item.lineTotalCents, item.currency)}</span>
                </li>
              ))}
            </ul>
          </div>

          {order.refunds.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">Refunds</p>
              <ul className="space-y-2">
                {order.refunds.map(refund => (
                  <li key={refund.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <span className="truncate">{formatDateTime(refund.createdAt)}{refund.reason ? ` · ${refund.reason}` : ''}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {formatMoney(refund.amountCents, order.currency)}
                      <StatusBadge status={refund.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canRefund && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <input
                value={refundReason}
                onChange={event => setRefundReason(event.target.value)}
                placeholder="Refund reason (optional)"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="px-4 py-2 rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50 text-sm"
              >
                {refunding ? 'Refunding...' : 'Issue full refund'}
              </button>
            </div>
          )}
        </div>
      )}
    </AdminCard>
  );
}

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const load = () => {
    listOrders({ status: statusFilter || undefined, limit: LIMIT, offset })
      .then(setData)
      .catch(err => setError(err.message));
  };

  useEffect(load, [statusFilter, offset]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Orders</h1>
        <select
          value={statusFilter}
          onChange={event => {
            setOffset(0);
            setStatusFilter(event.target.value);
          }}
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && <ErrorBlock message={error} />}

      <div className={`grid gap-6 ${selectedOrderId ? 'lg:grid-cols-[1fr_400px]' : ''}`}>
        <AdminCard>
          {!data ? <LoadingBlock /> : (
            <>
              <AdminTable
                columns={['Reference', 'Traveler', 'Destination', 'Total', 'Commission', 'Status', 'Created']}
                rows={data.orders}
                emptyMessage="No orders found."
                renderRow={order => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`cursor-pointer hover:bg-white/5 ${selectedOrderId === order.id ? 'bg-white/5' : ''}`}
                  >
                    <td className="px-5 py-3 font-mono text-xs">{order.reference}</td>
                    <td className="px-5 py-3 text-white/60">{order.userEmail}</td>
                    <td className="px-5 py-3 text-white/60">{order.destination}</td>
                    <td className="px-5 py-3">{formatMoney(order.totalCents, order.currency)}</td>
                    <td className="px-5 py-3 text-white/60">{formatMoney(order.commissionCents, order.currency)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-white/60">{formatDate(order.createdAt)}</td>
                  </tr>
                )}
              />
              <Pager offset={offset} limit={LIMIT} total={data.total} onChange={setOffset} />
            </>
          )}
        </AdminCard>

        {selectedOrderId && (
          <OrderDetailPanel
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onRefunded={load}
          />
        )}
      </div>
    </div>
  );
}
