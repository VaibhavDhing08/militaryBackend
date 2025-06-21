const express = require('express');
const pool = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

const assetRoutes = require('./routes/assetRoutes');
const authRoutes = require('./routes/authRoutes');  

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('DB connection error', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
