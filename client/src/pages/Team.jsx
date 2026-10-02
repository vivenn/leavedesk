import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTeam } from '../api/users.api';
import { getTeamRequests } from '../api/leaveRequests.api';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiMessage } from '../api/http';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([getTeam(user.id), getTeamRequests()])
      .then(([team, reqRes]) => {
        setMembers(team);
        setRequests(reqRes.data || []);
      })
      .catch((err) => setError(apiMessage(err, 'Failed to load team')))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">My Team</h1>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <Card title={`Team members (${members.length})`}>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-slate-400">No direct reports.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <li key={m.id} className="rounded-lg border border-slate-100 p-3">
                <p className="text-sm font-medium text-slate-800">
                  {m.firstName} {m.lastName}
                </p>
                <p className="text-xs text-slate-500">{m.email}</p>
                {m.department && <p className="mt-1 text-xs text-slate-400">{m.department.name}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Team leave calendar">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-400">No leave requests from your team yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Leave type</th>
                <th className="pb-2 font-medium">Dates</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 font-medium text-slate-800">
                    {req.user.firstName} {req.user.lastName}
                  </td>
                  <td className="py-3 text-slate-600">{req.leaveTypeName}</td>
                  <td className="py-3 text-slate-600">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
