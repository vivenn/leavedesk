import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboard.api';
import { StatTile, Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiMessage } from '../api/http';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(apiMessage(err, 'Failed to load dashboard')));
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  const { employee, manager, admin } = data;

  return (
    <div className="space-y-8">
      {admin && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">Organization</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Employees" value={admin.orgSummary.totalEmployees} tone="brand" />
            <StatTile label="Pending" value={admin.orgSummary.pendingRequests} tone="warn" />
            <StatTile label="Approved (mo)" value={admin.orgSummary.approvedThisMonth} />
            <StatTile label="Rejected (mo)" value={admin.orgSummary.rejectedThisMonth} tone="danger" />
            <StatTile label="Requests (mo)" value={admin.orgSummary.totalThisMonth} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card title="Department breakdown">
              {admin.departmentBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No data this month.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {admin.departmentBreakdown.map((d) => (
                    <li key={d.departmentName} className="flex justify-between">
                      <span className="text-slate-600">{d.departmentName}</span>
                      <span className="font-medium text-slate-800">{d.daysTaken} days · {d.employeesOnLeave} people</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Leave type breakdown">
              {admin.leaveTypeBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No data this month.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {admin.leaveTypeBreakdown.map((t) => (
                    <li key={t.leaveTypeName} className="flex justify-between">
                      <span className="text-slate-600">{t.leaveTypeName}</span>
                      <span className="font-medium text-slate-800">{t.totalRequests} requests · {t.daysTaken} days</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </section>
      )}

      {manager && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">Team</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Pending approvals" value={manager.teamSummary.pendingApprovals} tone="warn" />
            <StatTile label="Employees on leave" value={manager.teamSummary.employeesOnLeave} />
            <StatTile label="Approved this month" value={manager.teamSummary.approvedThisMonth} />
          </div>

          <div className="mt-4">
            <Card
              title="Pending approvals"
              action={
                <Link to="/approvals" className="text-xs font-medium text-brand-600 hover:underline">
                  View all
                </Link>
              }
            >
              {manager.pendingApprovals.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing waiting on you.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {manager.pendingApprovals.slice(0, 5).map((req) => (
                    <li key={req.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium text-slate-800">
                          {req.employee.firstName} {req.employee.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {req.leaveTypeName} · {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">My Leave</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total requests" value={employee.requestSummary.total} />
          <StatTile label="Pending" value={employee.requestSummary.pending} tone="warn" />
          <StatTile label="Approved" value={employee.requestSummary.approved} />
          <StatTile label="Rejected" value={employee.requestSummary.rejected} tone="danger" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Leave balances">
            {employee.balances.length === 0 ? (
              <p className="text-sm text-slate-400">No balances initialized yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {employee.balances.map((b) => (
                  <li key={`${b.leaveTypeName}-${b.financialYear}`} className="flex items-center justify-between">
                    <span className="text-slate-600">{b.leaveTypeName}</span>
                    <span className="font-medium text-slate-800">
                      {b.availableBalance} / {b.openingBalance} available
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Recent requests"
            action={
              <Link to="/my-leaves" className="text-xs font-medium text-brand-600 hover:underline">
                View all
              </Link>
            }
          >
            {employee.recentRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No requests yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {employee.recentRequests.map((req) => (
                  <li key={req.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{req.leaveTypeName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(req.startDate)} – {formatDate(req.endDate)} · {req.numDays} day(s)
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
