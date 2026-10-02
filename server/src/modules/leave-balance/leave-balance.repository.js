import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    leaveTypeId: row.leave_type_id,
    leaveTypeName: row.leave_type_name,
    financialYear: row.financial_year,
    openingBalance: parseFloat(row.opening_balance),
    availableBalance: parseFloat(row.available_balance),
    usedBalance: parseFloat(row.used_balance),
    carryforwardBalance: parseFloat(row.carryforward_balance),
    updatedAt: row.updated_at
  };
}

export async function findByUser(userId, financialYear) {
  const { rows } = await pool.query(
    `SELECT lb.*, lt.leave_type_name
     FROM leave_balances lb
     JOIN leave_types lt ON lb.leave_type_id = lt.id
     WHERE lb.user_id = $1 AND lb.financial_year = $2
     ORDER BY lt.leave_type_name`,
    [userId, financialYear]
  );
  return rows.map(mapRow);
}

export async function findOne(userId, leaveTypeId, financialYear) {
  const { rows } = await pool.query(
    `SELECT lb.*, lt.leave_type_name
     FROM leave_balances lb
     JOIN leave_types lt ON lb.leave_type_id = lt.id
     WHERE lb.user_id = $1 AND lb.leave_type_id = $2 AND lb.financial_year = $3`,
    [userId, leaveTypeId, financialYear]
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT lb.*, lt.leave_type_name
     FROM leave_balances lb
     JOIN leave_types lt ON lb.leave_type_id = lt.id
     WHERE lb.id = $1`,
    [id]
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function create({ userId, leaveTypeId, financialYear, openingBalance, carryforwardBalance }) {
  const available = openingBalance + (carryforwardBalance || 0);
  const { rows } = await pool.query(
    `INSERT INTO leave_balances (user_id, leave_type_id, financial_year, opening_balance, available_balance, used_balance, carryforward_balance)
     VALUES ($1, $2, $3, $4, $5, 0, $6)
     ON CONFLICT (user_id, leave_type_id, financial_year) DO NOTHING
     RETURNING id`,
    [userId, leaveTypeId, financialYear, openingBalance, available, carryforwardBalance || 0]
  );
  return rows.length > 0 ? rows[0].id : null;
}

export async function deductBalance(id, days) {
  await pool.query(
    `UPDATE leave_balances
     SET available_balance = available_balance - $1,
         used_balance = used_balance + $1,
         updated_at = NOW()
     WHERE id = $2`,
    [days, id]
  );
}

export async function restoreBalance(id, days) {
  await pool.query(
    `UPDATE leave_balances
     SET available_balance = available_balance + $1,
         used_balance = used_balance - $1,
         updated_at = NOW()
     WHERE id = $2`,
    [days, id]
  );
}

export async function setBalance(id, newAvailable) {
  await pool.query(
    `UPDATE leave_balances
     SET available_balance = $1, updated_at = NOW()
     WHERE id = $2`,
    [newAvailable, id]
  );
}
