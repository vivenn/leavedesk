import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function seed() {
  await client.connect();
  console.log('Connected to database\n');

  // Seed Roles
  console.log('Seeding roles...');
  await client.query(`
    INSERT INTO roles (role_name, description) VALUES
      ('Employee', 'Regular employee who can apply for leaves'),
      ('Manager', 'Team manager who can approve or reject leave requests'),
      ('Administrator', 'System administrator with full access')
    ON CONFLICT (role_name) DO NOTHING;
  `);

  // Seed Leave Types
  console.log('Seeding leave types...');
  await client.query(`
    INSERT INTO leave_types (leave_type_name, yearly_limit, is_carryforward_allowed, max_carryforward_days, expiry_days) VALUES
      ('PL', 15, TRUE, 5, NULL),
      ('SL', 10, FALSE, NULL, NULL),
      ('MCL', 5, FALSE, NULL, NULL),
      ('Comp-Off', 0, FALSE, NULL, 365)
    ON CONFLICT (leave_type_name) DO NOTHING;
  `);

  // Seed Holidays (2025-2026)
  console.log('Seeding holidays...');
  await client.query(`
    INSERT INTO holidays (holiday_name, holiday_date, holiday_type, financial_year) VALUES
      ('Republic Day', '2026-01-26', 'PUBLIC', '2025-2026'),
      ('Holi', '2026-03-17', 'PUBLIC', '2025-2026'),
      ('Independence Day', '2025-08-15', 'PUBLIC', '2025-2026'),
      ('Gandhi Jayanti', '2025-10-02', 'PUBLIC', '2025-2026'),
      ('Diwali', '2025-10-20', 'PUBLIC', '2025-2026'),
      ('Christmas', '2025-12-25', 'PUBLIC', '2025-2026'),
      ('Makar Sankranti', '2026-01-14', 'REGIONAL', '2025-2026'),
      ('Raksha Bandhan', '2025-08-09', 'COMPANY', '2025-2026')
    ON CONFLICT DO NOTHING;
  `);

  console.log('\nSeeding complete.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
