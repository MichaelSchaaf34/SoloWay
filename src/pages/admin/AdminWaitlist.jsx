import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { listWaitlist } from '../../utils/adminService';
import { AdminCard, AdminTable, Pager, LoadingBlock, ErrorBlock, formatDate } from './adminUi';

const LIMIT = 50;

export default function AdminWaitlist() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    listWaitlist({ limit: LIMIT, offset })
      .then(setData)
      .catch(err => setError(err.message));
  }, [offset]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows = [];
      let cursor = 0;
      let total = Infinity;
      while (cursor < total) {
        const page = await listWaitlist({ limit: 100, offset: cursor });
        rows.push(...page.entries);
        total = page.total;
        cursor += 100;
        if (!page.entries.length) break;
      }
      const csv = [
        'email,referral_code,position,created_at',
        ...rows.map(entry =>
          [entry.email, entry.referralCode || '', entry.position ?? '', entry.createdAt].join(',')
        ),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'soloway-waitlist.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Waitlist</h1>
        <button
          onClick={exportCsv}
          disabled={exporting || !data?.total}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-sm"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {error && <ErrorBlock message={error} />}

      <AdminCard>
        {!data ? <LoadingBlock /> : (
          <>
            <AdminTable
              columns={['Email', 'Referral code', 'Position', 'Signed up']}
              rows={data.entries}
              emptyMessage="No waitlist signups yet."
              renderRow={entry => (
                <tr key={entry.id}>
                  <td className="px-5 py-3">{entry.email}</td>
                  <td className="px-5 py-3 text-white/60">{entry.referralCode || '—'}</td>
                  <td className="px-5 py-3 text-white/60">{entry.position ?? '—'}</td>
                  <td className="px-5 py-3 text-white/60">{formatDate(entry.createdAt)}</td>
                </tr>
              )}
            />
            <Pager offset={offset} limit={LIMIT} total={data.total} onChange={setOffset} />
          </>
        )}
      </AdminCard>
    </div>
  );
}
