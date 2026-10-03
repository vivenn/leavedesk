import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import requestLogger from './shared/middleware/request-logger.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import roleRoutes from './modules/role/role.routes.js';
import departmentRoutes from './modules/department/department.routes.js';
import leaveTypeRoutes from './modules/leave-type/leave-type.routes.js';
import holidayRoutes from './modules/holiday/holiday.routes.js';
import leaveBalanceRoutes from './modules/leave-balance/leave-balance.routes.js';
import leaveRequestRoutes from './modules/leave-request/leave-request.routes.js';
import approvalRoutes from './modules/approval/approval.routes.js';
import bloodRelationRoutes from './modules/blood-relation-leave/blood-relation.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import reportRoutes from './modules/report/report.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

// Register event listeners
import './modules/leave-balance/leave-balance.listener.js';
import './modules/notification/notification.listener.js';
import './modules/audit/audit.listener.js';

const app = express();

// Middleware
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true
}));
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Module routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/blood-relation-leaves', bloodRelationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
