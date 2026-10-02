import { useEffect, useState } from 'react';
import { getPendingApprovals, approveRequest, rejectRequest } from '../api/approvals.api';
import { Card } from '../components/Card';
import { apiMessage } from '../api/http';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ActionModal({ request, action, onClose, onDone }) {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSubmitting(true);
    setError('');
    try {
      if (action === 'approve') {
        await approveRequest(request.id, remarks);
      } else {
        await rejectRequest(request.id, remarks);
      }
      onDone();
    } catch (err) {
      setError(apiMessage(err, `Failed to ${action} request`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-800">
          {action === 'approve' ? 'Approve' : 'Reject'} request from {request.first_name} {request.last_name}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {request.leave_type_name} · {formatDate(request.start_date)} – {formatDate(request.end_date)}
        </p>
        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        <textarea
          rows={3}
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 ${
              action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {submitting ? 'Saving…' : action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Approvals() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  function load() {
    setLoading(true);
    getPendingApprovals()
      .then(setRequests)
      .catch((err) => setError(apiMessage(err, 'Failed to load approvals')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Pending Approvals</h1>
      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-400">No pending approvals. You're all caught up.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Leave type</th>
                <th className="pb-2 font-medium">Dates</th>
                <th className="pb-2 font-medium">Days</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3">
                    <p className="font-medium text-slate-800">
                      {req.first_name} {req.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{req.email}</p>
                  </td>
                  <td className="py-3 text-slate-600">{req.leave_type_name}</td>
                  <td className="py-3 text-slate-600">
                    {formatDate(req.start_date)} – {formatDate(req.end_date)}
                  </td>
                  <td className="py-3 text-slate-600">{req.num_days}</td>
                  <td className="max-w-xs truncate py-3 text-slate-600" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="space-x-3 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setModal({ request: req, action: 'approve' })}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ request: req, action: 'reject' })}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal && (
        <ActionModal
          request={modal.request}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
