import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/roles';
import { listHolidays, createHoliday, updateHoliday, deleteHoliday } from '../api/holidays.api';
import { Card } from '../components/Card';
import { apiMessage } from '../api/http';
import { currentFinancialYear } from '../lib/financialYear';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const emptyForm = { holidayName: '', holidayDate: '', holidayType: 'PUBLIC', financialYear: '' };

export function Holidays() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm, financialYear: currentFinancialYear() });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    listHolidays()
      .then(setHolidays)
      .catch((err) => setError(apiMessage(err, 'Failed to load holidays')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(holiday) {
    setEditingId(holiday.id);
    setForm({
      holidayName: holiday.holidayName,
      holidayDate: holiday.holidayDate?.slice(0, 10) ?? '',
      holidayType: holiday.holidayType,
      financialYear: holiday.financialYear,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, financialYear: currentFinancialYear() });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await updateHoliday(editingId, form);
      } else {
        await createHoliday(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to save holiday'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await deleteHoliday(id);
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to delete holiday'));
    }
  }

  return (
    <div className={isAdmin ? 'grid gap-6 lg:grid-cols-[1fr_320px]' : ''}>
      <div>
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Holidays</h1>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : holidays.length === 0 ? (
            <p className="text-sm text-slate-400">No holidays configured.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="pb-2 font-medium">Holiday</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Type</th>
                  {isAdmin && <th className="pb-2 font-medium"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 font-medium text-slate-800">{h.holidayName}</td>
                    <td className="py-3 text-slate-600">{formatDate(h.holidayDate)}</td>
                    <td className="py-3 text-slate-600">{h.holidayType}</td>
                    {isAdmin && (
                      <td className="space-x-3 py-3 text-right">
                        <button type="button" onClick={() => startEdit(h)} className="text-xs font-medium text-brand-600 hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(h.id)} className="text-xs font-medium text-rose-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>

      {isAdmin && (
        <div>
          <Card title={editingId ? 'Edit holiday' : 'Add holiday'}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="holidayName" className="mb-1 block text-xs font-medium text-slate-600">Name</label>
                <input
                  id="holidayName"
                  required
                  value={form.holidayName}
                  onChange={(e) => updateField('holidayName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="holidayDate" className="mb-1 block text-xs font-medium text-slate-600">Date</label>
                <input
                  id="holidayDate"
                  type="date"
                  required
                  value={form.holidayDate}
                  onChange={(e) => updateField('holidayDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="holidayType" className="mb-1 block text-xs font-medium text-slate-600">Type</label>
                <select
                  id="holidayType"
                  value={form.holidayType}
                  onChange={(e) => updateField('holidayType', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="COMPANY">Company</option>
                  <option value="REGIONAL">Regional</option>
                </select>
              </div>
              <div>
                <label htmlFor="financialYear" className="mb-1 block text-xs font-medium text-slate-600">Financial year</label>
                <input
                  id="financialYear"
                  required
                  placeholder="2025-2026"
                  pattern="\d{4}-\d{4}"
                  value={form.financialYear}
                  onChange={(e) => updateField('financialYear', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
