const STYLES = {
  PENDING: 'bg-amber-100 text-amber-800',
  MANAGER_APPROVED: 'bg-blue-100 text-blue-800',
  ADMIN_APPROVED: 'bg-blue-100 text-blue-800',
  ESCALATED: 'bg-violet-100 text-violet-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  CANCELLED: 'bg-slate-200 text-slate-600',
};

const LABELS = {
  PENDING: 'Pending',
  MANAGER_APPROVED: 'Manager Approved',
  ADMIN_APPROVED: 'Admin Approved',
  ESCALATED: 'Escalated',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-700';
  const label = LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
