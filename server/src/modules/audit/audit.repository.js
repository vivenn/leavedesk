import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.first_name ? `${row.first_name} ${row.last_name}` : null,
    actionType: row.action_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    oldValues: row.old_values,
    newValues: row.new_values,
    ipAddress: row.ip_address,
    createdAt: row.created_at
  };
}

export async function create({ userId, actionType, entityType, entityId, oldValues, newValues, ipAddress }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, actionType, entityType, entityId || null, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, ipAddress || null]
  );
}

export async function createBalanceAudit({ leaveBalanceId, previousBalance, newBalance, changeReason, leaveRequestId, changedBy }) {
  await pool.query(
    `INSERT INTO leave_balance_audit (leave_balance_id, previous_balance, new_balance, change_reason, leave_request_id, changed_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [leaveBalanceId, previousBalance, newBalance, changeReason, leaveRequestId || null, changedBy]
  );
}

export async function findAll({ limit, offset, userId, actionType, entityType, fromDate, toDate }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (userId) { conditions.push(`al.user_id = $${idx++}`); params.push(userId); }
  if (actionType) { conditions.push(`al.action_type = $${idx++}`); params.push(actionType); }
  if (entityType) { conditions.push(`al.entity_type = $${idx++}`); params.push(entityType); }
  if (fromDate) { conditions.push(`al.created_at >= $${idx++}`); params.push(fromDate); }
  // toDate is a calendar day, so include everything up to the end of it
  if (toDate) { conditions.push(`al.created_at < (CAST($${idx++} AS date) + INTERVAL '1 day')`); params.push(toDate); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM audit_logs al ${where}`, params
  );
  const total = parseInt(countRows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT al.*, u.first_name, u.last_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { logs: rows.map(mapRow), total };
}
