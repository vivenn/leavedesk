import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/roles';
import { getUnreadCount } from '../api/notifications.api';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN], end: true },
  { to: '/apply-leave', label: 'Apply Leave', roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/my-leaves', label: 'My Leaves', roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/blood-relation-leave', label: 'Blood Relation Leave', roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/holidays', label: 'Holidays', roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/approvals', label: 'Approvals', roles: [ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/team', label: 'Team', roles: [ROLES.MANAGER, ROLES.ADMIN] },
  { to: '/admin/users', label: 'Users', roles: [ROLES.ADMIN] },
  { to: '/admin/departments', label: 'Departments', roles: [ROLES.ADMIN] },
  { to: '/admin/leave-types', label: 'Leave Types', roles: [ROLES.ADMIN] },
  { to: '/admin/leave-balances', label: 'Leave Balances', roles: [ROLES.ADMIN] },
  { to: '/admin/reports', label: 'Reports', roles: [ROLES.ADMIN] },
  { to: '/admin/audit-logs', label: 'Audit Logs', roles: [ROLES.ADMIN] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUnreadCount()
      .then((data) => {
        if (!cancelled) setUnread(data.count ?? data.unreadCount ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex min-h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            LD
          </div>
          <span className="text-sm font-semibold text-slate-800">LeaveDesk</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm text-slate-500">
            {user?.role} workspace
          </span>
          <div className="flex items-center gap-4">
            <span className="relative text-slate-500">
              <span aria-hidden="true">🔔</span>
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
