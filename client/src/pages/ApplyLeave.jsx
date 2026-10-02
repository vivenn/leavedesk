import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listLeaveTypes } from '../api/leaveTypes.api';
import { applyLeave } from '../api/leaveRequests.api';
import { apiMessage } from '../api/http';
import { Card } from '../components/Card';

const initialForm = { leaveTypeId: '', startDate: '', endDate: '', reason: '', attachmentUrl: '' };

export function ApplyLeave() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.attachmentUrl) delete payload.attachmentUrl;
      await applyLeave(payload);
      setSuccess('Leave request submitted.');
      setForm(initialForm);
      setTimeout(() => navigate('/my-leaves'), 800);
    } catch (err) {
      setError(apiMessage(err, 'Failed to submit leave request'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Apply for Leave</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="leaveType">
              Leave type
            </label>
            <select
              id="leaveType"
              required
              value={form.leaveTypeId}
              onChange={(e) => updateField('leaveTypeId', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="" disabled>
                Select a leave type
              </option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.leaveTypeName} ({lt.yearlyLimit} days/year)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="startDate">
                Start date
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="endDate">
                End date
              </label>
              <input
                id="endDate"
                type="date"
                required
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="reason">
              Reason
            </label>
            <textarea
              id="reason"
              required
              minLength={3}
              maxLength={500}
              rows={4}
              value={form.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="attachmentUrl">
              Attachment URL <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="attachmentUrl"
              type="text"
              value={form.attachmentUrl}
              onChange={(e) => updateField('attachmentUrl', e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </Card>
    </div>
  );
}
