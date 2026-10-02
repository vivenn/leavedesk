import { useEffect, useState } from 'react';
import { listAuditLogs, listAuditActionTypes } from '../../api/auditLogs.api';
import { Card } from '../../components/Card';
import { apiMessage } from '../../api/http';

const PAGE_SIZE = 20;

const inputClass =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

function humanize(value) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValues(values) {
  if (!values) return null;
  return Object.entries(values)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' · ');
}

const ACTION_TONE = {
  LEAVE_APPROVED: 'bg-emerald-100 text-emerald-800',
  LEAVE_REJECTED: 'bg-rose-100 text-rose-800',
  LEAVE_OVERRIDDEN: 'bg-rose-100 text-rose-800',
  LEAVE_ESCALATED: 'bg-violet-100 text-violet-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  BALANCE_UPDATED: 'bg-blue-100 text-blue-800',
};

export function AuditLogs() {
  const [actionTypes, setActionTypes] = useState([]);
  const [filters, setFilters] = useState({ actionType: '', fromDate: '', toDate: '' });
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listAuditActionTypes()
      .then(setActionTypes)
      .catch(() => setActionTypes([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = { page, limit: PAGE_SIZE };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    listAuditLogs(params)
      .then((res) => {
        setLogs(res.data || []);
        setPagination(res.pagination || null);
      })
      .catch((err) => setError(apiMessage(err, 'Failed to load audit logs')))
      .finally(() => setLoading(false));
  }, [filters, page]);

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  }

  const totalPages = pagination?.totalPages || 1;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Audit Logs</h1>

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
          <label className="text-xs font-medium text-slate-600 sm:col-span-2">
            Action
            <select value={filters.actionType} onChange={(e) => updateFilter('actionType', e.target.value)} className={`mt-1 w-full ${inputClass}`}>
              <option value="">All actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {humanize(type)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            From
            <input type="date" value={filters.fromDate} onChange={(e) => updateFilter('fromDate', e.target.value)} className={`mt-1 w-full ${inputClass}`} />
          </label>
          <label className="text-xs font-medium text-slate-600">
            To
            <input
              type="date"
              value={filters.toDate}
              min={filters.fromDate || undefined}
              onChange={(e) => updateFilter('toDate', e.target.value)}
              className={`mt-1 w-full ${inputClass}`}
            />
          </label>
        </div>
      </Card>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400">No audit entries match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="pb-2 font-medium">When</th>
                  <th className="pb-2 font-medium">Who</th>
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">Entity</th>
                  <th className="pb-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="py-3 whitespace-nowrap text-slate-600">{formatTimestamp(log.createdAt)}</td>
                    <td className="py-3 text-slate-800">{log.userName || 'System'}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_TONE[log.actionType] || 'bg-slate-100 text-slate-700'}`}>
                        {humanize(log.actionType)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{log.entityType}</td>
                    <td className="max-w-md py-3 text-xs text-slate-500">
                      {log.oldValues && <p>Before — {formatValues(log.oldValues)}</p>}
                      {log.newValues && <p>After — {formatValues(log.newValues)}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} · {pagination.total} entries
            </span>
            <div className="space-x-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
