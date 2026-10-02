import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    relation: row.relation,
    isUsed: row.is_used,
    leaveRequestId: row.leave_request_id,
    usedDate: row.used_date,
    createdAt: row.created_at
  };
}

export async function findByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM blood_relation_leaves WHERE user_id = $1 ORDER BY relation',
    [userId]
  );
  return rows.map(mapRow);
}

export async function findOne(userId, relation) {
  const { rows } = await pool.query(
    'SELECT * FROM blood_relation_leaves WHERE user_id = $1 AND relation = $2',
    [userId, relation]
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function initialize(userId, relations) {
  for (const relation of relations) {
    await pool.query(
      `INSERT INTO blood_relation_leaves (user_id, relation)
       VALUES ($1, $2) ON CONFLICT (user_id, relation) DO NOTHING`,
      [userId, relation]
    );
  }
}

export async function markUsed(id, leaveRequestId) {
  await pool.query(
    `UPDATE blood_relation_leaves
     SET is_used = TRUE, leave_request_id = $1, used_date = CURRENT_DATE, updated_at = NOW()
     WHERE id = $2`,
    [leaveRequestId, id]
  );
}
