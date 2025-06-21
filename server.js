require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');

const assetRoutes = require('./routes/assetRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Function to auto-create required tables
async function initializeTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      base_id INTEGER NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS assets (
      asset_id SERIAL PRIMARY KEY,
      asset_name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      base_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      purchased_on DATE NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS transfers (
      transfer_id SERIAL PRIMARY KEY,
      asset_id INTEGER REFERENCES assets(asset_id),
      from_base_id INTEGER NOT NULL,
      to_base_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      transfer_date DATE NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS assignments (
      assignment_id SERIAL PRIMARY KEY,
      asset_id INTEGER REFERENCES assets(asset_id),
      personnel_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      assigned_date DATE NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS expenditures (
      expenditure_id SERIAL PRIMARY KEY,
      asset_id INTEGER REFERENCES assets(asset_id),
      quantity INTEGER NOT NULL,
      expended_date DATE NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS asset_logs (
      log_id SERIAL PRIMARY KEY,
      base_id INTEGER,
      action_type VARCHAR(50),
      asset_id INTEGER,
      quantity INTEGER,
      action_date DATE,
      user_id INTEGER
    );`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log('✅ Table checked/created');
    } catch (err) {
      console.error('❌ Error creating table:', err);
    }
  }
}

// Connect DB and initialize tables
pool.connect()
  .then(() => {
    console.log('🟢 Connected to PostgreSQL database successfully');
    initializeTables();
  })
  .catch(err => {
    console.error('🔴 Error connecting to PostgreSQL database:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);

app.get('/', (req, res) => {
  res.send('🟢 Military Asset Management Backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
