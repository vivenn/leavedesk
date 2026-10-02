import { useEffect, useState } from 'react';
import { getMyRelations, consumeRelationLeave } from '../api/bloodRelation.api';
import { Card } from '../components/Card';
import { apiMessage } from '../api/http';

function relationLabel(relation) {
  return relation
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join('-')
    .replace('-In-Law', '-in-law');
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ConfirmModal({ relation, onClose, onConfirmed }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSubmitting(true);
    setError('');
    try {
      await consumeRelationLeave({ relation: relation.relation });
      onConfirmed();
    } catch (err) {
      setError(apiMessage(err, 'Failed to apply blood relation leave'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-800">Use leave for {relationLabel(relation.relation)}?</h3>
        <p className="mt-2 text-sm text-slate-600">
          This leave can be used only once. After you confirm it will be marked as consumed and your manager will be notified.
        </p>
        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BloodRelationLeave() {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(null);

  function load() {
    setLoading(true);
    getMyRelations()
      .then(setRelations)
      .catch((err) => setError(apiMessage(err, 'Failed to load blood relation leaves')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Blood Relation Leave</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-500">
        Special leave for an emergency or the loss of a close family member. Each relation can be used once; after that it is
        marked as consumed.
      </p>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relations.map((rel) => (
            <Card key={rel.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{relationLabel(rel.relation)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {rel.isUsed ? `Used on ${formatDate(rel.usedDate)}` : 'One-time leave available'}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    rel.isUsed ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rel.isUsed ? 'Consumed' : 'Available'}
                </span>
              </div>
              <button
                type="button"
                disabled={rel.isUsed}
                onClick={() => setConfirming(rel)}
                className="mt-4 w-full rounded-lg border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
              >
                {rel.isUsed ? 'Already used' : 'Use leave'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {confirming && (
        <ConfirmModal
          relation={confirming}
          onClose={() => setConfirming(null)}
          onConfirmed={() => {
            setConfirming(null);
            load();
          }}
        />
      )}
    </div>
  );
}
