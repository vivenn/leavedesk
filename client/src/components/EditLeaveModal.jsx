import { useEffect, useState } from 'react';
import { listLeaveTypes } from '../api/leaveTypes.api';
import { updateRequest } from '../api/leaveRequests.api';
import { apiMessage } from '../api/http';

function toInputDate(value) {
  if (!value) return '';
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

export function EditLeaveModal({ request, onClose, onSaved }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveTypeId: request.leaveTypeId,
    startDate: toInputDate(request.startDate),
    endDate: toInputDate(request.endDate),
    reason: request.reason,
    attachmentUrl: request.attachmentUrl || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listLeaveTypes()
      .then(setLeaveTypes)
      .catch((err) => setError(apiMessage(err, 'Failed to load leave types')));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.attachmentUrl) delete payload.attachmentUrl;
      await updateRequest(request.id, payload);
      onSaved();
    } catch (err) {
      setError(apiMessage(err, 'Failed to update request'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-800">
          {request.status === 'CHANGES_REQUESTED' ? 'Update and resubmit request' : 'Edit leave request'}
        </h3>
        {request.status === 'CHANGES_REQUESTED' && request.lastRemarks && (
          <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-800">Requested change: {request.lastRemarks}</p>
        )}
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

        <label className="block text-xs font-medium text-slate-600">
          Leave type
          <select
            value={form.leaveTypeId}
            onChange={(e) => updateField('leaveTypeId', e.target.value)}
            className={`mt-1 ${inputClass}`}
            required
          >
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.leaveTypeName}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className={`mt-1 ${inputClass}`}
              required
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            End date
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className={`mt-1 ${inputClass}`}
              required
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Reason
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => updateField('reason', e.target.value)}
            className={`mt-1 ${inputClass}`}
            minLength={3}
            required
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Attachment URL (optional)
          <input
            type="url"
            value={form.attachmentUrl}
            onChange={(e) => updateField('attachmentUrl', e.target.value)}
            className={`mt-1 ${inputClass}`}
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
            {saving ? 'Saving…' : 'Save and resubmit'}
          </button>
        </div>
      </form>
    </div>
  );
}
