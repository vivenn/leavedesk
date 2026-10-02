import 'dotenv/config';
import app from './app.js';
import { validateEnv } from './config/environment.js';
import { testConnection } from './config/database.js';

validateEnv();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
