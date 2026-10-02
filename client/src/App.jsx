import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ApplyLeave } from './pages/ApplyLeave';
import { MyLeaves } from './pages/MyLeaves';
import { Holidays } from './pages/Holidays';
import { BloodRelationLeave } from './pages/BloodRelationLeave';
import { Approvals } from './pages/Approvals';
import { Team } from './pages/Team';
import { Users } from './pages/admin/Users';
import { Departments } from './pages/admin/Departments';
import { LeaveTypes } from './pages/admin/LeaveTypes';
import { Reports } from './pages/admin/Reports';
import { LeaveBalances } from './pages/admin/LeaveBalances';
import { AuditLogs } from './pages/admin/AuditLogs';
import { ROLES } from './context/roles';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apply-leave" element={<ApplyLeave />} />
          <Route path="/my-leaves" element={<MyLeaves />} />
          <Route path="/holidays" element={<Holidays />} />
          <Route path="/blood-relation-leave" element={<BloodRelationLeave />} />

          <Route element={<ProtectedRoute roles={[ROLES.MANAGER, ROLES.ADMIN]} />}>
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/team" element={<Team />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/leave-types" element={<LeaveTypes />} />
            <Route path="/admin/leave-balances" element={<LeaveBalances />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
