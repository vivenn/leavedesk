import { useEffect, useState } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../../api/users.api';
import { listRoles } from '../../api/roles.api';
import { listDepartments } from '../../api/departments.api';
import { initializeBalances } from '../../api/leaveBalances.api';
import { Card } from '../../components/Card';
import { apiMessage } from '../../api/http';
import { currentFinancialYear } from '../../lib/financialYear';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  roleId: '',
  departmentId: '',
  managerId: '',
};

export function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const managers = users.filter((u) => u.role?.name === 'Manager' || u.role?.name === 'Administrator');

  function load() {
    setLoading(true);
    listUsers({ limit: 100, search: search || undefined })
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(apiMessage(err, 'Failed to load users')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  useEffect(() => {
    listRoles().then(setRoles).catch(() => {});
    listDepartments().then(setDepartments).catch(() => {});
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(u) {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',
      phone: u.phone || '',
      roleId: u.role?.id || '',
      departmentId: u.department?.id || '',
      managerId: u.manager?.id || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function cleanPayload(payload) {
    const clean = { ...payload };
    if (!clean.departmentId) clean.departmentId = null;
    if (!clean.managerId) clean.managerId = null;
    if (!clean.phone) delete clean.phone;
    return clean;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        const { password: _password, ...rest } = cleanPayload(form);
        await updateUser(editingId, rest);
      } else {
        const res = await createUser(cleanPayload(form));
        await initializeBalances({ userId: res.data.id, financialYear: currentFinancialYear() });
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(u) {
    if (!window.confirm(`Deactivate ${u.firstName} ${u.lastName}?`)) return;
    try {
      await deleteUser(u.id);
      load();
    } catch (err) {
      setError(apiMessage(err, 'Failed to deactivate user'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Users</h1>
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400">No users found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Manager</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <p className="font-medium text-slate-800">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 text-slate-600">{u.role?.name}</td>
                    <td className="py-3 text-slate-600">{u.department?.name || '—'}</td>
                    <td className="py-3 text-slate-600">
                      {u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : '—'}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${u.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="space-x-3 py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => startEdit(u)} className="text-xs font-medium text-brand-600 hover:underline">
                        Edit
                      </button>
                      {u.isActive && (
                        <button type="button" onClick={() => handleDeactivate(u)} className="text-xs font-medium text-rose-600 hover:underline">
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div>
        <Card title={editingId ? 'Edit user' : 'Add user'}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-slate-600">First name</label>
                <input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-slate-600">Last name</label>
                <input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <input
                id="email"
                type="email"
                required
                disabled={Boolean(editingId)}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
            {!editingId && (
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-600">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs font-medium text-slate-600">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="roleId" className="mb-1 block text-xs font-medium text-slate-600">Role</label>
              <select
                id="roleId"
                required
                value={form.roleId}
                onChange={(e) => updateField('roleId', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="" disabled>
                  Select role
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="departmentId" className="mb-1 block text-xs font-medium text-slate-600">Department</label>
              <select
                id="departmentId"
                value={form.departmentId}
                onChange={(e) => updateField('departmentId', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="managerId" className="mb-1 block text-xs font-medium text-slate-600">Manager</label>
              <select
                id="managerId"
                value={form.managerId}
                onChange={(e) => updateField('managerId', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">None</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
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
