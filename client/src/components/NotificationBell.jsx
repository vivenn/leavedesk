import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markRead, markAllRead } from '../api/notifications.api';

const POLL_INTERVAL_MS = 60_000;

// Where a notification should take the user when clicked
const TARGETS = {
  LEAVE_APPLIED: '/approvals',
  LEAVE_RESUBMITTED: '/approvals',
  LEAVE_ESCALATED: '/approvals',
  LEAVE_APPROVED: '/my-leaves',
  LEAVE_REJECTED: '/my-leaves',
  LEAVE_CANCELLED: '/my-leaves',
  CHANGES_REQUESTED: '/my-leaves',
  BALANCE_LOW: '/',
  BLOOD_RELATION_USED: '/team',
};

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then((data) => setUnread(data.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    getNotifications({ limit: 10 })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false);
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleSelect(item) {
    if (!item.isRead) {
      await markRead(item.id).catch(() => {});
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnread((count) => Math.max(count - 1, 0));
    }
    setOpen(false);
    navigate(TARGETS[item.notificationType] || '/');
  }

  async function handleMarkAll() {
    await markAllRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={handleMarkAll} className="text-xs font-medium text-brand-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">You're all caught up.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`block w-full px-4 py-3 text-left hover:bg-slate-50 ${item.isRead ? '' : 'bg-brand-50/60'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${item.isRead ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{item.title}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{item.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
