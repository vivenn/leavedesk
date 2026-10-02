import pool from '../../config/database.js';

const BASE_SELECT = `
  SELECT d.id, d.department_name, d.is_active, d.created_at,
         p.id AS parent_id, p.department_name AS parent_name
  FROM departments d
  LEFT JOIN departments p ON d.parent_department_id = p.id
`;

function mapRow(row) {
  return {
    id: row.id,
    departmentName: row.department_name,
    isActive: row.is_active,
    parent: row.parent_id
      ? { id: row.parent_id, departmentName: row.parent_name }
      : null,
    createdAt: row.created_at
  };
}

export async function findAll() {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE d.is_active = TRUE ORDER BY d.department_name`
  );
  return rows.map(mapRow);
}

export async function findById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE d.id = $1`, [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function findByName(name) {
  const { rows } = await pool.query(
    'SELECT id FROM departments WHERE department_name = $1', [name]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function create({ departmentName, parentDepartmentId }) {
  const { rows } = await pool.query(
    `INSERT INTO departments (department_name, parent_department_id)
     VALUES ($1, $2) RETURNING id`,
    [departmentName, parentDepartmentId || null]
  );
  return rows[0].id;
}

export async function update(id, fields) {
  const setClauses = [];
  const params = [];
  let idx = 1;

  if (fields.departmentName !== undefined) {
    setClauses.push(`department_name = $${idx++}`);
    params.push(fields.departmentName);
  }
  if (fields.parentDepartmentId !== undefined) {
    setClauses.push(`parent_department_id = $${idx++}`);
    params.push(fields.parentDepartmentId);
  }
  if (fields.isActive !== undefined) {
    setClauses.push(`is_active = $${idx++}`);
    params.push(fields.isActive);
  }

  if (setClauses.length === 0) return;

  params.push(id);
  await pool.query(
    `UPDATE departments SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );
}

export async function softDelete(id) {
  await pool.query(
    'UPDATE departments SET is_active = FALSE WHERE id = $1', [id]
  );
}
