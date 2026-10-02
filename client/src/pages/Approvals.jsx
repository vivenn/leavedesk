import { useEffect, useState } from 'react';
import {
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  escalateRequest,
  requestChanges,
} from '../api/approvals.api';
import { getAllRequests } from '../api/leaveRequests.api';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/roles';
import { apiMessage } from '../api/http';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const ACTIONS = {
  approve: { label: 'Approve', button: 'bg-emerald-600 hover:bg-emerald-700', link: 'text-emerald-600', call: approveRequest },
  reject: { label: 'Reject', button: 'bg-rose-600 hover:bg-rose-700', link: 'text-rose-600', call: rejectRequest },
  escalate: { label: 'Escalate', button: 'bg-violet-600 hover:bg-violet-700', link: 'text-violet-600', call: escalateRequest },
  changes: {
    label: 'Request changes',
    button: 'bg-orange-600 hover:bg-orange-700',
    link: 'text-orange-600',
    call: requestChanges,
    remarksRequired: true,
  },
  revoke: {
    label: 'Revoke approval',
    button: 'bg-rose-600 hover:bg-rose-700',
    link: 'text-rose-600',
    call: rejectRequest,
    remarksRequired: true,
  },
  reinstate: {
    label: 'Approve instead',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    link: 'text-emerald-600',
    call: approveRequest,
    remarksRequired: true,
  },
};

const PENDING_ACTIONS = {
  [ROLES.MANAGER]: ['approve', 'reject', 'escalate', 'changes'],
  [ROLES.ADMIN]: ['approve', 'reject', 'changes'],
};

// Pending rows come back snake_case, leave-request rows camelCase — normalise both
function normalize(row) {
  return {
    id: row.id,
    employee: row.user ? `${row.user.firstName} ${row.user.lastName}` : `${row.first_name} ${row.last_name}`,
    email: row.user?.email ?? row.email,
    leaveType: row.leaveTypeName ?? row.leave_type_name,
    startDate: row.startDate ?? row.start_date,
    endDate: row.endDate ?? row.end_date,
    numDays: Number(row.numDays ?? row.num_days),
    reason: row.reason,
    status: row.status,
    lastRemarks: row.last_remarks,
  };
}

function ActionModal({ request, action, onClose, onDone }) {
  const config = ACTIONS[action];
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (config.remarksRequired && remarks.trim().length < 3) {
      setError('Please add a short remark (at least 3 characters).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await config.call(request.id, remarks.trim());
      onDone();
    } catch (err) {
      setError(apiMessage(err, `Failed to ${config.label.toLowerCase()}`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-800">
          {config.label} — {request.employee}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {request.leaveType} · {formatDate(request.startDate)} – {formatDate(request.endDate)} · {request.numDays} day(s)
        </p>
        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        <textarea
          rows={3}
          placeholder={config.remarksRequired ? 'Remarks (required)' : 'Remarks (optional)'}
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
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 ${config.button}`}
          >
            {submitting ? 'Saving…' : config.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestTable({ requests, actionsFor, onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
            <th className="pb-2 font-medium">Employee</th>
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
            <tr key={req.id} className="align-top">
              <td className="py-3">
                <p className="font-medium text-slate-800">{req.employee}</p>
                <p className="text-xs text-slate-500">{req.email}</p>
              </td>
              <td className="py-3 text-slate-600">{req.leaveType}</td>
              <td className="py-3 text-slate-600">
                {formatDate(req.startDate)} – {formatDate(req.endDate)}
              </td>
              <td className="py-3 text-slate-600">{req.numDays}</td>
              <td className="max-w-xs py-3 text-slate-600">
                <p className="truncate" title={req.reason}>{req.reason}</p>
                {req.status === 'ESCALATED' && req.lastRemarks && (
                  <p className="mt-1 text-xs text-violet-700">Manager note: {req.lastRemarks}</p>
                )}
              </td>
              <td className="py-3">
                <StatusBadge status={req.status} />
              </td>
              <td className="space-x-3 py-3 text-right whitespace-nowrap">
                {actionsFor(req).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => onAction(req, action)}
                    className={`text-xs font-medium hover:underline ${ACTIONS[action].link}`}
                  >
                    {ACTIONS[action].label}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingTab({ role, onAction, reloadKey }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPendingApprovals()
      .then((rows) => setRequests(rows.map(normalize)))
      .catch((err) => setError(apiMessage(err, 'Failed to load approvals')))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>;
  if (requests.length === 0) return <p className="text-sm text-slate-400">No pending approvals. You're all caught up.</p>;

  return <RequestTable requests={requests} actionsFor={() => PENDING_ACTIONS[role] || []} onAction={onAction} />;
}

function DecidedTab({ onAction, reloadKey }) {
  const [status, setStatus] = useState('APPROVED');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllRequests({ status, limit: 50 })
      .then((res) => setRequests((res.data || []).map(normalize)))
      .catch((err) => setError(apiMessage(err, 'Failed to load requests')))
      .finally(() => setLoading(false));
  }, [status, reloadKey]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Admins can override a final decision. Revoking an approval returns the days to the employee.</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-400">No {status.toLowerCase()} requests.</p>
      ) : (
        <RequestTable
          requests={requests}
          actionsFor={(req) => (req.status === 'APPROVED' ? ['revoke'] : ['reinstate'])}
          onAction={onAction}
        />
      )}
    </div>
  );
}

export function Approvals() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [tab, setTab] = useState('pending');
  const [modal, setModal] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const openModal = (request, action) => setModal({ request, action });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Approvals</h1>
        {isAdmin && (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
            {[
              ['pending', 'Pending'],
              ['decided', 'Override decisions'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-md px-3 py-1.5 font-medium ${tab === key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card>
        {tab === 'pending' ? (
          <PendingTab role={user?.role} onAction={openModal} reloadKey={reloadKey} />
        ) : (
          <DecidedTab onAction={openModal} reloadKey={reloadKey} />
        )}
      </Card>

      {modal && (
        <ActionModal
          request={modal.request}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
