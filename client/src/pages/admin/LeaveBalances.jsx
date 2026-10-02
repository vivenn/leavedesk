import { useEffect, useState } from 'react';
import { listUsers } from '../../api/users.api';
import { getUserBalances, adjustBalance, initializeBalances } from '../../api/leaveBalances.api';
import { Card } from '../../components/Card';
import { apiMessage } from '../../api/http';
import { currentFinancialYear, financialYearOptions } from '../../lib/financialYear';

const inputClass =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

function AdjustModal({ user, balance, financialYear, onClose, onSaved }) {
  const [available, setAvailable] = useState(String(balance.availableBalance));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const value = Number(available);
    if (Number.isNaN(value) || value < 0) {
      setError('Balance must be zero or a positive number.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await adjustBalance(user.id, {
        leaveTypeId: balance.leaveTypeId,
        financialYear,
        availableBalance: value,
        reason: reason.trim(),
      });
      onSaved();
    } catch (err) {
      setError(apiMessage(err, 'Failed to adjust balance'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-5 shadow-lg">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Adjust {balance.leaveTypeName} balance</h3>
          <p className="mt-1 text-xs text-slate-500">
            {user.firstName} {user.lastName} · FY {financialYear} · currently {balance.availableBalance} day(s)
          </p>
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        <label className="block text-xs font-medium text-slate-600">
          New available balance (days)
          <input
            type="number"
            min="0"
            step="0.5"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
            className={`mt-1 w-full ${inputClass}`}
            required
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Reason (saved to the audit log)
          <input
            type="text"
            maxLength={100}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Comp-off for weekend release"
            className={`mt-1 w-full ${inputClass}`}
            required
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function LeaveBalances() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [financialYear, setFinancialYear] = useState(currentFinancialYear());
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const selectedUser = users.find((u) => u.id === userId);

  useEffect(() => {
    listUsers({ limit: 100, isActive: true })
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(apiMessage(err, 'Failed to load users')));
  }, []);

  function loadBalances() {
    if (!userId) {
      setBalances([]);
      return;
    }
    setLoading(true);
    setError('');
    getUserBalances(userId, financialYear)
      .then(setBalances)
      .catch((err) => setError(apiMessage(err, 'Failed to load balances')))
      .finally(() => setLoading(false));
  }

  useEffect(loadBalances, [userId, financialYear]);

  async function handleInitialize() {
    setInitializing(true);
    setError('');
    try {
      await initializeBalances({ userId, financialYear });
      loadBalances();
    } catch (err) {
      setError(apiMessage(err, 'Failed to initialise balances'));
    } finally {
      setInitializing(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Leave Balances</h1>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-medium text-slate-600">
            Employee
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={`mt-1 w-full ${inputClass}`}>
              <option value="">Select an employee…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — {u.email}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Financial year
            <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} className={`mt-1 w-full ${inputClass}`}>
              {financialYearOptions().map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {userId && (
        <Card title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Balances'}>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : balances.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">No balances for FY {financialYear} yet.</p>
              <button
                type="button"
                onClick={handleInitialize}
                disabled={initializing}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {initializing ? 'Initialising…' : 'Initialise from leave policy'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                    <th className="pb-2 font-medium">Leave type</th>
                    <th className="pb-2 font-medium">Opening</th>
                    <th className="pb-2 font-medium">Carried forward</th>
                    <th className="pb-2 font-medium">Used</th>
                    <th className="pb-2 font-medium">Available</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balances.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 font-medium text-slate-800">{b.leaveTypeName}</td>
                      <td className="py-3 text-slate-600">{b.openingBalance}</td>
                      <td className="py-3 text-slate-600">{b.carryforwardBalance}</td>
                      <td className="py-3 text-slate-600">{b.usedBalance}</td>
                      <td className="py-3 font-semibold text-slate-900">{b.availableBalance}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditing(b)}
                          className="text-xs font-medium text-brand-600 hover:underline"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {editing && selectedUser && (
        <AdjustModal
          user={selectedUser}
          balance={editing}
          financialYear={financialYear}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadBalances();
          }}
        />
      )}
    </div>
  );
}
