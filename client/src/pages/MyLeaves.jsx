import { useEffect, useState } from 'react';
import { getMyRequests, cancelRequest } from '../api/leaveRequests.api';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/Card';
import { apiMessage } from '../api/http';
import { EditLeaveModal } from '../components/EditLeaveModal';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_FILTERS = ['', 'PENDING', 'ESCALATED', 'CHANGES_REQUESTED', 'MANAGER_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED'];
const NON_CANCELLABLE = new Set(['CANCELLED', 'REJECTED']);
const EDITABLE = new Set(['PENDING', 'CHANGES_REQUESTED']);
const SHOW_REMARKS = new Set(['CHANGES_REQUESTED', 'REJECTED', 'ESCALATED']);

export function MyLeaves() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [editing, setEditing] = useState(null);

  function load() {
    setLoading(true);
    getMyRequests(status ? { status } : {})
      .then((res) => setRequests(res.data || []))
      .catch((err) => setError(apiMessage(err, 'Failed to load leave requests')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status]);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this leave request?')) return;
    setCancellingId(id);
    try {
      await cancelRequest(id);
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to cancel request'));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">My Leave History</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? s.replaceAll('_', ' ') : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-400">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <th className="pb-2 font-medium">Leave type</th>
                <th className="pb-2 font-medium">Dates</th>
                <th className="pb-2 font-medium">Days</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 font-medium text-slate-800">{req.leaveTypeName}</td>
                  <td className="py-3 text-slate-600">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                  </td>
                  <td className="py-3 text-slate-600">{req.numDays}</td>
                  <td className="max-w-xs truncate py-3 text-slate-600" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={req.status} />
                    {SHOW_REMARKS.has(req.status) && req.lastRemarks && (
                      <p className="mt-1 max-w-[14rem] text-xs text-slate-500">“{req.lastRemarks}”</p>
                    )}
                  </td>
                  <td className="space-x-3 py-3 text-right whitespace-nowrap">
                    {EDITABLE.has(req.status) && (
                      <button
                        type="button"
                        onClick={() => setEditing(req)}
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        {req.status === 'CHANGES_REQUESTED' ? 'Update' : 'Edit'}
                      </button>
                    )}
                    {!NON_CANCELLABLE.has(req.status) && (
                      <button
                        type="button"
                        disabled={cancellingId === req.id}
                        onClick={() => handleCancel(req.id)}
                        className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
                      >
                        {cancellingId === req.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {editing && (
        <EditLeaveModal
          request={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
