require('dotenv').config();  // Load env variables from .env file
const { Pool } = require('pg');

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Optional: test connection immediately when server starts
pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL database successfully'))
  .catch(err => {
    console.error('🔴 Error connecting to PostgreSQL database:', err);
    process.exit(1); // exit process if connection fails
  });

module.exports = pool;
