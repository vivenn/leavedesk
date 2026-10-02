import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    leaveRequestId: row.leave_request_id,
    approverId: row.approver_id,
    approverRole: row.approver_role,
    approverFirstName: row.approver_first_name,
    approverLastName: row.approver_last_name,
    status: row.status,
    remarks: row.remarks,
    approvedAt: row.approved_at,
    createdAt: row.created_at
  };
}

export async function create({ leaveRequestId, approverId, approverRole, status, remarks }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_approvals (leave_request_id, approver_id, approver_role, status, remarks, approved_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
    [leaveRequestId, approverId, approverRole, status, remarks || null]
  );
  return rows[0].id;
}

export async function findByLeaveRequest(leaveRequestId) {
  const { rows } = await pool.query(
    `SELECT la.*, u.first_name AS approver_first_name, u.last_name AS approver_last_name
     FROM leave_approvals la
     JOIN users u ON la.approver_id = u.id
     WHERE la.leave_request_id = $1
     ORDER BY la.created_at`,
    [leaveRequestId]
  );
  return rows.map(mapRow);
}

export async function findPendingForManager(managerId, { limit, offset }) {
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     WHERE u.manager_id = $1 AND lr.status = 'PENDING'`,
    [managerId]
  );
  const total = parseInt(countRows[0].count, 10);

  const { rows } = await pool.query(
    `SELECT lr.id, lr.user_id, lr.leave_type_id, lr.start_date, lr.end_date,
            lr.num_days, lr.reason, lr.status, lr.financial_year, lr.created_at,
            lt.leave_type_name,
            u.first_name, u.last_name, u.email,
            (SELECT la.remarks FROM leave_approvals la
             WHERE la.leave_request_id = lr.id
             ORDER BY la.created_at DESC LIMIT 1) AS last_remarks
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     JOIN users u ON lr.user_id = u.id
     WHERE u.manager_id = $1 AND lr.status = 'PENDING'
     ORDER BY lr.created_at
     LIMIT $2 OFFSET $3`,
    [managerId, limit, offset]
  );

  return { requests: rows, total };
}

export async function findPendingForAdmin({ limit, offset }) {
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM leave_requests WHERE status IN ('PENDING', 'MANAGER_APPROVED', 'ESCALATED')`
  );
  const total = parseInt(countRows[0].count, 10);

  const { rows } = await pool.query(
    `SELECT lr.id, lr.user_id, lr.leave_type_id, lr.start_date, lr.end_date,
            lr.num_days, lr.reason, lr.status, lr.financial_year, lr.created_at,
            lt.leave_type_name,
            u.first_name, u.last_name, u.email,
            (SELECT la.remarks FROM leave_approvals la
             WHERE la.leave_request_id = lr.id
             ORDER BY la.created_at DESC LIMIT 1) AS last_remarks
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     JOIN users u ON lr.user_id = u.id
     WHERE lr.status IN ('PENDING', 'MANAGER_APPROVED', 'ESCALATED')
     ORDER BY (lr.status = 'ESCALATED') DESC, lr.created_at
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return { requests: rows, total };
}
