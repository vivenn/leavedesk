import pool from '../../config/database.js';

const BASE_SELECT = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
         u.is_active, u.created_at, u.updated_at,
         r.id AS role_id, r.role_name,
         d.id AS department_id, d.department_name,
         m.id AS manager_id, m.first_name AS manager_first_name, m.last_name AS manager_last_name
  FROM users u
  JOIN roles r ON u.role_id = r.id
  LEFT JOIN departments d ON u.department_id = d.id
  LEFT JOIN users m ON u.manager_id = m.id
`;

function mapRow(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    isActive: row.is_active,
    role: { id: row.role_id, name: row.role_name },
    department: row.department_id
      ? { id: row.department_id, name: row.department_name }
      : null,
    manager: row.manager_id
      ? { id: row.manager_id, firstName: row.manager_first_name, lastName: row.manager_last_name }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findAll({ limit, offset, role, department, isActive, search }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (role) {
    conditions.push(`r.role_name = $${idx++}`);
    params.push(role);
  }
  if (department) {
    conditions.push(`u.department_id = $${idx++}`);
    params.push(department);
  }
  if (isActive !== undefined && isActive !== '') {
    conditions.push(`u.is_active = $${idx++}`);
    params.push(isActive === 'true');
  }
  if (search) {
    conditions.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id LEFT JOIN departments d ON u.department_id = d.id ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { users: rows.map(mapRow), total };
}

export async function findById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE u.id = $1`, [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function create({ firstName, lastName, email, passwordHash, phone, roleId, departmentId, managerId }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id, department_id, manager_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [firstName, lastName, email, passwordHash, phone || null, roleId, departmentId || null, managerId || null]
  );
  return rows[0].id;
}

export async function update(id, fields) {
  const setClauses = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phone: 'phone',
    roleId: 'role_id',
    departmentId: 'department_id',
    managerId: 'manager_id',
    isActive: 'is_active'
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (fields[key] !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push(`updated_at = NOW()`);
  params.push(id);

  await pool.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );
}

export async function softDelete(id) {
  await pool.query(
    'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
    [id]
  );
}

export async function findTeam(managerId) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE u.manager_id = $1 AND u.is_active = TRUE ORDER BY u.first_name`,
    [managerId]
  );
  return rows.map(mapRow);
}
