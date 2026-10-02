import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function seedAdmin() {
  await client.connect();
  console.log('Connected to database\n');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const { rows: roles } = await client.query(
    "SELECT id FROM roles WHERE role_name = 'Administrator'"
  );

  if (roles.length === 0) {
    console.error('Administrator role not found. Run main seed first.');
    process.exit(1);
  }

  const { rows: existing } = await client.query(
    "SELECT id FROM users WHERE email = 'admin@leavedesk.com'"
  );

  if (existing.length > 0) {
    console.log('Admin user already exists. Skipping.');
  } else {
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['System', 'Admin', 'admin@leavedesk.com', passwordHash, roles[0].id]
    );
    console.log('Admin user created:');
    console.log('  Email:    admin@leavedesk.com');
    console.log('  Password: admin123');
  }

  await client.end();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
