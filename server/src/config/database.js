import pg from 'pg';
import { getEnv } from './environment.js';

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    const env = getEnv();
    pool = new Pool({
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
}

export async function testConnection() {
  const p = getPool();
  const client = await p.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('Database connected:', result.rows[0].now);
  } finally {
    client.release();
  }
}

export default {
  query: (...args) => getPool().query(...args),
  connect: () => getPool().connect()
};
