require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Test DB connection on startup
pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL database successfully'))
  .catch(err => {
    console.error('🔴 Error connecting to PostgreSQL database:', err);
    process.exit(1);
  });

module.exports = pool;
