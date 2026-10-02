import { useEffect, useState } from 'react';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments.api';
import { Card } from '../../components/Card';
import { apiMessage } from '../../api/http';

const emptyForm = { departmentName: '', parentDepartmentId: '' };

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    listDepartments()
      .then(setDepartments)
      .catch((err) => setError(apiMessage(err, 'Failed to load departments')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(d) {
    setEditingId(d.id);
    setForm({ departmentName: d.departmentName, parentDepartmentId: d.parent?.id || '' });
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
      const payload = { ...form, parentDepartmentId: form.parentDepartmentId || null };
      if (editingId) {
        await updateDepartment(editingId, payload);
      } else {
        await createDepartment(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to save department'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this department?')) return;
    try {
      await deleteDepartment(id);
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to delete department'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Departments</h1>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : departments.length === 0 ? (
            <p className="text-sm text-slate-400">No departments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {departments.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-slate-800">{d.departmentName}</span>
                  <span className="space-x-3">
                    <button type="button" onClick={() => startEdit(d)} className="text-xs font-medium text-brand-600 hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(d.id)} className="text-xs font-medium text-rose-600 hover:underline">
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div>
        <Card title={editingId ? 'Edit department' : 'Add department'}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="departmentName" className="mb-1 block text-xs font-medium text-slate-600">Name</label>
              <input
                id="departmentName"
                required
                value={form.departmentName}
                onChange={(e) => updateField('departmentName', e.target.value)}
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
