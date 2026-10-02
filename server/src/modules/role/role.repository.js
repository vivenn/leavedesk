import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    roleName: row.role_name,
    description: row.description
  };
}

export async function findAllActive() {
  const { rows } = await pool.query(
    `SELECT id, role_name, description FROM roles WHERE is_active = TRUE ORDER BY role_name`
  );
  return rows.map(mapRow);
}
