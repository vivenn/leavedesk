import { useEffect, useState } from 'react';
import {
  getOverallSummary,
  getEmployeeWiseSummary,
  getDepartmentWiseSummary,
  getLeaveTypeWiseSummary,
} from '../../api/reports.api';
import { Card, StatTile } from '../../components/Card';
import { apiMessage } from '../../api/http';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function Reports() {
  const [month, setMonth] = useState(currentMonth());
  const [overall, setOverall] = useState(null);
  const [byEmployee, setByEmployee] = useState([]);
  const [byDepartment, setByDepartment] = useState([]);
  const [byLeaveType, setByLeaveType] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getOverallSummary(month),
      getEmployeeWiseSummary(month),
      getDepartmentWiseSummary(month),
      getLeaveTypeWiseSummary(month),
    ])
      .then(([o, e, d, l]) => {
        setOverall(o);
        setByEmployee(e);
        setByDepartment(d);
        setByLeaveType(l);
      })
      .catch((err) => setError(apiMessage(err, 'Failed to load reports')))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {overall && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Total requests" value={overall.total_requests} />
              <StatTile label="Approved" value={overall.approved_count} />
              <StatTile label="Rejected" value={overall.rejected_count} tone="danger" />
              <StatTile label="Pending" value={overall.pending_count} tone="warn" />
              <StatTile label="Cancelled" value={overall.cancelled_count} />
              <StatTile label="Days taken" value={overall.total_days_taken} tone="brand" />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="By department">
              {byDepartment.length === 0 ? (
                <p className="text-sm text-slate-400">No data for this month.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {byDepartment.map((d) => (
                    <li key={d.department_id} className="flex justify-between">
                      <span className="text-slate-600">{d.department_name}</span>
                      <span className="font-medium text-slate-800">{d.days_taken} days · {d.employee_count} people</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="By leave type">
              {byLeaveType.length === 0 ? (
                <p className="text-sm text-slate-400">No data for this month.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {byLeaveType.map((t) => (
                    <li key={t.leave_type_id} className="flex justify-between">
                      <span className="text-slate-600">{t.leave_type_name}</span>
                      <span className="font-medium text-slate-800">{t.total_requests} requests · {t.days_taken} days</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="By employee">
            {byEmployee.length === 0 ? (
              <p className="text-sm text-slate-400">No data for this month.</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Department</th>
                    <th className="pb-2 font-medium">Requests</th>
                    <th className="pb-2 font-medium">Approved</th>
                    <th className="pb-2 font-medium">Rejected</th>
                    <th className="pb-2 font-medium">Days taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byEmployee.map((e) => (
                    <tr key={e.user_id}>
                      <td className="py-2 font-medium text-slate-800">
                        {e.first_name} {e.last_name}
                      </td>
                      <td className="py-2 text-slate-600">{e.department_name || '—'}</td>
                      <td className="py-2 text-slate-600">{e.total_requests}</td>
                      <td className="py-2 text-slate-600">{e.approved_count}</td>
                      <td className="py-2 text-slate-600">{e.rejected_count}</td>
                      <td className="py-2 text-slate-600">{e.days_taken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
