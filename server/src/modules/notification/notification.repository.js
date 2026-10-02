import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    notificationType: row.notification_type,
    leaveRequestId: row.leave_request_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at
  };
}

export async function findByRecipient(recipientId, { limit, offset }) {
  const { rows: countRows } = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1',
    [recipientId]
  );
  const total = parseInt(countRows[0].count, 10);

  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE recipient_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [recipientId, limit, offset]
  );

  return { notifications: rows.map(mapRow), total };
}

export async function getUnreadCount(recipientId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = FALSE',
    [recipientId]
  );
  return parseInt(rows[0].count, 10);
}

export async function create({ recipientId, notificationType, leaveRequestId, title, message }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (recipient_id, notification_type, leave_request_id, title, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [recipientId, notificationType, leaveRequestId || null, title, message]
  );
  return rows[0].id;
}

export async function markRead(id, recipientId) {
  const { rowCount } = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2',
    [id, recipientId]
  );
  return rowCount > 0;
}

export async function markAllRead(recipientId) {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE',
    [recipientId]
  );
}
