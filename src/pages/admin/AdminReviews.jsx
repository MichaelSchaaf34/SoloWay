import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { listReviews, deleteReview } from '../../utils/adminService';
import { AdminCard, Pager, LoadingBlock, ErrorBlock, formatDate } from './adminUi';

const LIMIT = 25;

export default function AdminReviews() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    listReviews({ limit: LIMIT, offset })
      .then(setData)
      .catch(err => setError(err.message));
  };

  useEffect(load, [offset]);

  const handleDelete = async review => {
    if (!window.confirm(`Delete this review of ${review.destinationSlug} by ${review.userEmail}?`)) return;
    setDeletingId(review.id);
    try {
      await deleteReview(review.id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reviews</h1>

      {error && <ErrorBlock message={error} />}

      <AdminCard>
        {!data ? <LoadingBlock /> : (
          <>
            {data.reviews.length === 0 ? (
              <p className="px-5 py-8 text-sm text-white/40 text-center">No reviews yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data.reviews.map(review => (
                  <li key={review.id} className="px-5 py-4 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Star className="w-4 h-4 fill-current" />
                          {review.rating}
                        </span>
                        <span className="text-white font-medium truncate">
                          {review.title || review.destinationSlug}
                        </span>
                        <span className="text-white/40 text-xs shrink-0">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/60 line-clamp-2">{review.body}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {review.reviewerName} · {review.userEmail} · {review.destinationSlug} · {review.travelStyle}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(review)}
                      disabled={deletingId === review.id}
                      className="self-center shrink-0 p-2 rounded-lg text-red-300 bg-red-400/10 hover:bg-red-400/20 disabled:opacity-40"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Pager offset={offset} limit={LIMIT} total={data.total} onChange={setOffset} />
          </>
        )}
      </AdminCard>
    </div>
  );
}
