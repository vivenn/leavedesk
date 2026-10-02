import pool from '../../config/database.js';

export async function getEmployeeStats(userId) {
  const { rows: balanceRows } = await pool.query(
    `SELECT lt.leave_type_name, lb.opening_balance, lb.available_balance, lb.used_balance, lb.financial_year
     FROM leave_balances lb
     JOIN leave_types lt ON lb.leave_type_id = lt.id
     WHERE lb.user_id = $1
     ORDER BY lb.financial_year DESC, lt.leave_type_name`,
    [userId]
  );

  const { rows: requestRows } = await pool.query(
    `SELECT
       COUNT(*) AS total_requests,
       COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
       COUNT(*) FILTER (WHERE status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved,
       COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected,
       COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled
     FROM leave_requests
     WHERE user_id = $1`,
    [userId]
  );

  const { rows: upcomingRows } = await pool.query(
    `SELECT lr.id, lt.leave_type_name, lr.start_date, lr.end_date, lr.num_days, lr.status
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.user_id = $1
       AND lr.start_date >= CURRENT_DATE
       AND lr.status IN ('PENDING','APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')
     ORDER BY lr.start_date ASC
     LIMIT 5`,
    [userId]
  );

  const { rows: recentRows } = await pool.query(
    `SELECT lr.id, lt.leave_type_name, lr.start_date, lr.end_date, lr.num_days, lr.status, lr.created_at
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.user_id = $1
     ORDER BY lr.created_at DESC
     LIMIT 5`,
    [userId]
  );

  return {
    balances: balanceRows.map(r => ({
      leaveTypeName: r.leave_type_name,
      openingBalance: parseFloat(r.opening_balance),
      availableBalance: parseFloat(r.available_balance),
      usedBalance: parseFloat(r.used_balance),
      financialYear: r.financial_year
    })),
    requestSummary: {
      total: parseInt(requestRows[0].total_requests, 10),
      pending: parseInt(requestRows[0].pending, 10),
      approved: parseInt(requestRows[0].approved, 10),
      rejected: parseInt(requestRows[0].rejected, 10),
      cancelled: parseInt(requestRows[0].cancelled, 10)
    },
    upcomingLeaves: upcomingRows.map(r => ({
      id: r.id,
      leaveTypeName: r.leave_type_name,
      startDate: r.start_date,
      endDate: r.end_date,
      numDays: r.num_days,
      status: r.status
    })),
    recentRequests: recentRows.map(r => ({
      id: r.id,
      leaveTypeName: r.leave_type_name,
      startDate: r.start_date,
      endDate: r.end_date,
      numDays: r.num_days,
      status: r.status,
      createdAt: r.created_at
    }))
  };
}

export async function getManagerStats(managerId) {
  const { rows: pendingRows } = await pool.query(
    `SELECT lr.id, lt.leave_type_name, lr.start_date, lr.end_date, lr.num_days, lr.status, lr.created_at,
            u.first_name, u.last_name, u.email
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     JOIN users u ON lr.user_id = u.id
     WHERE u.manager_id = $1
       AND lr.status = 'PENDING'
     ORDER BY lr.created_at ASC`,
    [managerId]
  );

  const { rows: teamSummary } = await pool.query(
    `SELECT
       COUNT(DISTINCT lr.user_id) AS employees_on_leave,
       COUNT(*) FILTER (WHERE lr.status = 'PENDING') AS pending_approvals,
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_this_month
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     WHERE u.manager_id = $1
       AND lr.created_at >= date_trunc('month', CURRENT_DATE)`,
    [managerId]
  );

  const { rows: teamOnLeave } = await pool.query(
    `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email,
            lr.start_date, lr.end_date, lt.leave_type_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE u.manager_id = $1
       AND lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')
       AND lr.start_date <= CURRENT_DATE
       AND lr.end_date >= CURRENT_DATE
     ORDER BY u.first_name`,
    [managerId]
  );

  return {
    pendingApprovals: pendingRows.map(r => ({
      id: r.id,
      leaveTypeName: r.leave_type_name,
      startDate: r.start_date,
      endDate: r.end_date,
      numDays: r.num_days,
      status: r.status,
      createdAt: r.created_at,
      employee: { firstName: r.first_name, lastName: r.last_name, email: r.email }
    })),
    teamSummary: {
      employeesOnLeave: parseInt(teamSummary[0].employees_on_leave, 10),
      pendingApprovals: parseInt(teamSummary[0].pending_approvals, 10),
      approvedThisMonth: parseInt(teamSummary[0].approved_this_month, 10)
    },
    teamOnLeaveToday: teamOnLeave.map(r => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      startDate: r.start_date,
      endDate: r.end_date,
      leaveTypeName: r.leave_type_name
    }))
  };
}

export async function getAdminStats() {
  const { rows: orgSummary } = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_employees,
       COUNT(*) FILTER (WHERE lr.status = 'PENDING') AS pending_requests,
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_this_month,
       COUNT(*) FILTER (WHERE lr.status = 'REJECTED') AS rejected_this_month,
       COUNT(*) AS total_this_month
     FROM leave_requests lr
     WHERE lr.created_at >= date_trunc('month', CURRENT_DATE)`
  );

  const { rows: deptBreakdown } = await pool.query(
    `SELECT d.department_name,
       COUNT(DISTINCT lr.user_id) AS employees_on_leave,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS days_taken
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN departments d ON u.department_id = d.id
     WHERE lr.created_at >= date_trunc('month', CURRENT_DATE)
     GROUP BY d.id, d.department_name
     ORDER BY days_taken DESC`
  );

  const { rows: leaveTypeBreakdown } = await pool.query(
    `SELECT lt.leave_type_name,
       COUNT(*) AS total_requests,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS days_taken
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.created_at >= date_trunc('month', CURRENT_DATE)
     GROUP BY lt.id, lt.leave_type_name
     ORDER BY total_requests DESC`
  );

  const { rows: upcomingHolidays } = await pool.query(
    `SELECT holiday_name, holiday_date, holiday_type
     FROM holidays
     WHERE holiday_date >= CURRENT_DATE
     ORDER BY holiday_date ASC
     LIMIT 5`
  );

  return {
    orgSummary: {
      totalEmployees: parseInt(orgSummary[0].total_employees, 10),
      pendingRequests: parseInt(orgSummary[0].pending_requests, 10),
      approvedThisMonth: parseInt(orgSummary[0].approved_this_month, 10),
      rejectedThisMonth: parseInt(orgSummary[0].rejected_this_month, 10),
      totalThisMonth: parseInt(orgSummary[0].total_this_month, 10)
    },
    departmentBreakdown: deptBreakdown.map(r => ({
      departmentName: r.department_name,
      employeesOnLeave: parseInt(r.employees_on_leave, 10),
      daysTaken: parseFloat(r.days_taken)
    })),
    leaveTypeBreakdown: leaveTypeBreakdown.map(r => ({
      leaveTypeName: r.leave_type_name,
      totalRequests: parseInt(r.total_requests, 10),
      daysTaken: parseFloat(r.days_taken)
    })),
    upcomingHolidays: upcomingHolidays.map(r => ({
      name: r.holiday_name,
      date: r.holiday_date,
      type: r.holiday_type
    }))
  };
}
