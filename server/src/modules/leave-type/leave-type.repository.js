import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    leaveTypeName: row.leave_type_name,
    yearlyLimit: row.yearly_limit,
    isCarryforwardAllowed: row.is_carryforward_allowed,
    maxCarryforwardDays: row.max_carryforward_days,
    expiryDays: row.expiry_days,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export async function findAll() {
  const { rows } = await pool.query(
    'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY leave_type_name'
  );
  return rows.map(mapRow);
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM leave_types WHERE id = $1', [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function findByName(name) {
  const { rows } = await pool.query(
    'SELECT id FROM leave_types WHERE leave_type_name = $1', [name]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO leave_types (leave_type_name, yearly_limit, is_carryforward_allowed, max_carryforward_days, expiry_days)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [data.leaveTypeName, data.yearlyLimit, data.isCarryforwardAllowed, data.maxCarryforwardDays || null, data.expiryDays || null]
  );
  return rows[0].id;
}

export async function update(id, fields) {
  const setClauses = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    leaveTypeName: 'leave_type_name',
    yearlyLimit: 'yearly_limit',
    isCarryforwardAllowed: 'is_carryforward_allowed',
    maxCarryforwardDays: 'max_carryforward_days',
    expiryDays: 'expiry_days',
    isActive: 'is_active'
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (fields[key] !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return;

  params.push(id);
  await pool.query(
    `UPDATE leave_types SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );
}

export async function softDelete(id) {
  await pool.query('UPDATE leave_types SET is_active = FALSE WHERE id = $1', [id]);
}
