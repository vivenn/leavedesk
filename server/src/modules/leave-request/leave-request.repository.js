import pool from '../../config/database.js';

const BASE_SELECT = `
  SELECT lr.id, lr.user_id, lr.leave_type_id, lr.start_date, lr.end_date,
         lr.num_days, lr.reason, lr.attachment_url, lr.status,
         lr.financial_year, lr.created_at, lr.updated_at,
         lt.leave_type_name,
         u.first_name, u.last_name, u.email, u.manager_id
  FROM leave_requests lr
  JOIN leave_types lt ON lr.leave_type_id = lt.id
  JOIN users u ON lr.user_id = u.id
`;

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    leaveTypeId: row.leave_type_id,
    leaveTypeName: row.leave_type_name,
    startDate: row.start_date,
    endDate: row.end_date,
    numDays: parseFloat(row.num_days),
    reason: row.reason,
    attachmentUrl: row.attachment_url,
    status: row.status,
    financialYear: row.financial_year,
    managerId: row.manager_id,
    user: {
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findByUser(userId, { limit, offset, status, leaveType, fromDate, toDate, financialYear }) {
  const conditions = ['lr.user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (status) { conditions.push(`lr.status = $${idx++}`); params.push(status); }
  if (leaveType) { conditions.push(`lr.leave_type_id = $${idx++}`); params.push(leaveType); }
  if (fromDate) { conditions.push(`lr.start_date >= $${idx++}`); params.push(fromDate); }
  if (toDate) { conditions.push(`lr.end_date <= $${idx++}`); params.push(toDate); }
  if (financialYear) { conditions.push(`lr.financial_year = $${idx++}`); params.push(financialYear); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM leave_requests lr ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY lr.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { requests: rows.map(mapRow), total };
}

export async function findByTeam(managerId, { limit, offset, status }) {
  const conditions = ['u.manager_id = $1'];
  const params = [managerId];
  let idx = 2;

  if (status) { conditions.push(`lr.status = $${idx++}`); params.push(status); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM leave_requests lr JOIN users u ON lr.user_id = u.id ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY lr.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { requests: rows.map(mapRow), total };
}

export async function findAll({ limit, offset, status, financialYear }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) { conditions.push(`lr.status = $${idx++}`); params.push(status); }
  if (financialYear) { conditions.push(`lr.financial_year = $${idx++}`); params.push(financialYear); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM leave_requests lr ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY lr.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { requests: rows.map(mapRow), total };
}

export async function findById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE lr.id = $1`, [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function create({ userId, leaveTypeId, startDate, endDate, numDays, reason, attachmentUrl, financialYear }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, num_days, reason, attachment_url, financial_year)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [userId, leaveTypeId, startDate, endDate, numDays, reason, attachmentUrl || null, financialYear]
  );
  return rows[0].id;
}

export async function updateStatus(id, status) {
  await pool.query(
    'UPDATE leave_requests SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, id]
  );
}

export async function findOverlapping(userId, startDate, endDate, excludeId) {
  const params = [userId, startDate, endDate];
  let excludeClause = '';
  if (excludeId) {
    excludeClause = ' AND id != $4';
    params.push(excludeId);
  }

  const { rows } = await pool.query(
    `SELECT id FROM leave_requests
     WHERE user_id = $1
       AND status NOT IN ('CANCELLED', 'REJECTED')
       AND start_date <= $3 AND end_date >= $2
       ${excludeClause}`,
    params
  );
  return rows;
}
