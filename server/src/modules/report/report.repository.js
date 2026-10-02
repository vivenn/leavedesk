import pool from '../../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    reportType: row.report_type,
    reportMonth: row.report_month,
    departmentId: row.department_id,
    departmentName: row.department_name || null,
    reportData: row.report_data,
    generatedBy: row.generated_by,
    generatedByName: row.first_name ? `${row.first_name} ${row.last_name}` : null,
    generatedAt: row.generated_at
  };
}

export async function create({ reportType, reportMonth, departmentId, reportData, generatedBy }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_reports (report_type, report_month, department_id, report_data, generated_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [reportType, reportMonth, departmentId || null, JSON.stringify(reportData), generatedBy]
  );
  return rows[0].id;
}

export async function findAll({ limit, offset, reportType, reportMonth }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (reportType) { conditions.push(`lr.report_type = $${idx++}`); params.push(reportType); }
  if (reportMonth) { conditions.push(`lr.report_month = $${idx++}`); params.push(reportMonth); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM leave_reports lr ${where}`, params
  );
  const total = parseInt(countRows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT lr.*, d.department_name, u.first_name, u.last_name
     FROM leave_reports lr
     LEFT JOIN departments d ON lr.department_id = d.id
     LEFT JOIN users u ON lr.generated_by = u.id
     ${where}
     ORDER BY lr.generated_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  return { reports: rows.map(mapRow), total };
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT lr.*, d.department_name, u.first_name, u.last_name
     FROM leave_reports lr
     LEFT JOIN departments d ON lr.department_id = d.id
     LEFT JOIN users u ON lr.generated_by = u.id
     WHERE lr.id = $1`,
    [id]
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function getOverallSummary(month) {
  const startDate = `${month}-01`;
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_count,
       COUNT(*) FILTER (WHERE lr.status = 'REJECTED') AS rejected_count,
       COUNT(*) FILTER (WHERE lr.status = 'PENDING') AS pending_count,
       COUNT(*) FILTER (WHERE lr.status = 'CANCELLED') AS cancelled_count,
       COUNT(*) AS total_requests,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS total_days_taken
     FROM leave_requests lr
     WHERE lr.created_at >= $1::date
       AND lr.created_at < ($1::date + INTERVAL '1 month')`,
    [startDate]
  );
  return rows[0];
}

export async function getEmployeeWiseSummary(month) {
  const startDate = `${month}-01`;
  const { rows } = await pool.query(
    `SELECT
       u.id AS user_id, u.first_name, u.last_name, u.email,
       d.department_name,
       COUNT(*) AS total_requests,
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_count,
       COUNT(*) FILTER (WHERE lr.status = 'REJECTED') AS rejected_count,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS days_taken
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE lr.created_at >= $1::date
       AND lr.created_at < ($1::date + INTERVAL '1 month')
     GROUP BY u.id, u.first_name, u.last_name, u.email, d.department_name
     ORDER BY days_taken DESC`,
    [startDate]
  );
  return rows;
}

export async function getDepartmentWiseSummary(month) {
  const startDate = `${month}-01`;
  const { rows } = await pool.query(
    `SELECT
       d.id AS department_id, d.department_name,
       COUNT(DISTINCT lr.user_id) AS employee_count,
       COUNT(*) AS total_requests,
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_count,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS days_taken
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN departments d ON u.department_id = d.id
     WHERE lr.created_at >= $1::date
       AND lr.created_at < ($1::date + INTERVAL '1 month')
     GROUP BY d.id, d.department_name
     ORDER BY days_taken DESC`,
    [startDate]
  );
  return rows;
}

export async function getLeaveTypeWiseSummary(month) {
  const startDate = `${month}-01`;
  const { rows } = await pool.query(
    `SELECT
       lt.id AS leave_type_id, lt.leave_type_name,
       COUNT(*) AS total_requests,
       COUNT(*) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')) AS approved_count,
       COUNT(*) FILTER (WHERE lr.status = 'REJECTED') AS rejected_count,
       COALESCE(SUM(lr.num_days) FILTER (WHERE lr.status IN ('APPROVED','MANAGER_APPROVED','ADMIN_APPROVED')), 0) AS days_taken
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.created_at >= $1::date
       AND lr.created_at < ($1::date + INTERVAL '1 month')
     GROUP BY lt.id, lt.leave_type_name
     ORDER BY days_taken DESC`,
    [startDate]
  );
  return rows;
}
