import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    holidayName: row.holiday_name,
    holidayDate: row.holiday_date,
    holidayType: row.holiday_type,
    financialYear: row.financial_year,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export async function findAll({ financialYear, holidayType } = {}) {
  const conditions = ['is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (financialYear) {
    conditions.push(`financial_year = $${idx++}`);
    params.push(financialYear);
  }
  if (holidayType) {
    conditions.push(`holiday_type = $${idx++}`);
    params.push(holidayType);
  }

  const { rows } = await pool.query(
    `SELECT * FROM holidays WHERE ${conditions.join(' AND ')} ORDER BY holiday_date`,
    params
  );
  return rows.map(mapRow);
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM holidays WHERE id = $1', [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function findUpcoming() {
  const { rows } = await pool.query(
    `SELECT * FROM holidays
     WHERE holiday_date >= CURRENT_DATE AND is_active = TRUE
     ORDER BY holiday_date LIMIT 10`
  );
  return rows.map(mapRow);
}

export async function findBetweenDates(startDate, endDate) {
  const { rows } = await pool.query(
    `SELECT holiday_date FROM holidays
     WHERE holiday_date BETWEEN $1 AND $2 AND is_active = TRUE`,
    [startDate, endDate]
  );
  return rows.map((r) => r.holiday_date);
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO holidays (holiday_name, holiday_date, holiday_type, financial_year)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [data.holidayName, data.holidayDate, data.holidayType, data.financialYear]
  );
  return rows[0].id;
}

export async function update(id, fields) {
  const setClauses = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    holidayName: 'holiday_name',
    holidayDate: 'holiday_date',
    holidayType: 'holiday_type',
    financialYear: 'financial_year',
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
    `UPDATE holidays SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    params
  );
}

export async function softDelete(id) {
  await pool.query('UPDATE holidays SET is_active = FALSE WHERE id = $1', [id]);
}
