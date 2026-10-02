import { useEffect, useState } from 'react';
import { listLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../../api/leaveTypes.api';
import { Card } from '../../components/Card';
import { apiMessage } from '../../api/http';

const emptyForm = {
  leaveTypeName: '',
  yearlyLimit: '',
  isCarryforwardAllowed: false,
  maxCarryforwardDays: '',
  expiryDays: '',
};

export function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    listLeaveTypes()
      .then(setLeaveTypes)
      .catch((err) => setError(apiMessage(err, 'Failed to load leave types')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(lt) {
    setEditingId(lt.id);
    setForm({
      leaveTypeName: lt.leaveTypeName,
      yearlyLimit: lt.yearlyLimit,
      isCarryforwardAllowed: lt.isCarryforwardAllowed,
      maxCarryforwardDays: lt.maxCarryforwardDays ?? '',
      expiryDays: lt.expiryDays ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        leaveTypeName: form.leaveTypeName,
        yearlyLimit: Number(form.yearlyLimit),
        isCarryforwardAllowed: form.isCarryforwardAllowed,
        maxCarryforwardDays: form.maxCarryforwardDays === '' ? null : Number(form.maxCarryforwardDays),
        expiryDays: form.expiryDays === '' ? null : Number(form.expiryDays),
      };
      if (editingId) {
        await updateLeaveType(editingId, payload);
      } else {
        await createLeaveType(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to save leave type'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this leave type?')) return;
    try {
      await deleteLeaveType(id);
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to delete leave type'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Leave Types</h1>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : leaveTypes.length === 0 ? (
            <p className="text-sm text-slate-400">No leave types configured.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Yearly limit</th>
                  <th className="pb-2 font-medium">Carryforward</th>
                  <th className="pb-2 font-medium">Expiry (days)</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveTypes.map((lt) => (
                  <tr key={lt.id}>
                    <td className="py-3 font-medium text-slate-800">{lt.leaveTypeName}</td>
                    <td className="py-3 text-slate-600">{lt.yearlyLimit}</td>
                    <td className="py-3 text-slate-600">
                      {lt.isCarryforwardAllowed ? `Yes (max ${lt.maxCarryforwardDays ?? '∞'})` : 'No'}
                    </td>
                    <td className="py-3 text-slate-600">{lt.expiryDays ?? '—'}</td>
                    <td className="space-x-3 py-3 text-right">
                      <button type="button" onClick={() => startEdit(lt)} className="text-xs font-medium text-brand-600 hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(lt.id)} className="text-xs font-medium text-rose-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div>
        <Card title={editingId ? 'Edit leave type' : 'Add leave type'}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="leaveTypeName" className="mb-1 block text-xs font-medium text-slate-600">Name</label>
              <input
                id="leaveTypeName"
                required
                value={form.leaveTypeName}
                onChange={(e) => updateField('leaveTypeName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="yearlyLimit" className="mb-1 block text-xs font-medium text-slate-600">Yearly limit (days)</label>
              <input
                id="yearlyLimit"
                type="number"
                min={0}
                required
                value={form.yearlyLimit}
                onChange={(e) => updateField('yearlyLimit', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={form.isCarryforwardAllowed}
                onChange={(e) => updateField('isCarryforwardAllowed', e.target.checked)}
              />
              Allow carryforward
            </label>
            {form.isCarryforwardAllowed && (
              <div>
                <label htmlFor="maxCarryforwardDays" className="mb-1 block text-xs font-medium text-slate-600">Max carryforward days</label>
                <input
                  id="maxCarryforwardDays"
                  type="number"
                  min={0}
                  value={form.maxCarryforwardDays}
                  onChange={(e) => updateField('maxCarryforwardDays', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label htmlFor="expiryDays" className="mb-1 block text-xs font-medium text-slate-600">Expiry (days, optional)</label>
              <input
                id="expiryDays"
                type="number"
                min={0}
                value={form.expiryDays}
                onChange={(e) => updateField('expiryDays', e.target.value)}
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
    </div>
  );
}
