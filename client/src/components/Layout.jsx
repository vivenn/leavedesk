import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/roles';
import { NotificationBell } from './NotificationBell';

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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex min-h-full">
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            LD
          </div>
          <span className="text-sm font-semibold text-slate-800">LeaveDesk</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.role} workspace</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <div className="hidden text-right sm:block">
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
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
