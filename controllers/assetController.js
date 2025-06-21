require('dotenv').config();
const pool = require('../config/db');
const AssetModel = require('../models/assetModel');

// Add a new asset purchase with logging
exports.addPurchase = async (req, res) => {
  const { asset_name, type, base_id, quantity, purchased_on } = req.body;
  const user_id = req.user.userId;

  try {
    await AssetModel.addPurchase(asset_name, type, base_id, quantity, purchased_on);

    // Log action
    await AssetModel.logAction(
      'Purchase',
      null,  // no asset_id at creation
      quantity,
      base_id,
      purchased_on,
      user_id
    );

    res.status(201).json({ message: 'Asset purchase recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add asset purchase.' });
  }
};

// getPurchases with optional filters
exports.getPurchases = async (req, res) => {
  const { type, startDate, endDate } = req.query;
  let query = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }
  if (startDate) {
    params.push(startDate);
    query += ` AND purchased_on >= $${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    query += ` AND purchased_on <= $${params.length}`;
  }

  query += ' ORDER BY purchased_on DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch asset purchases.' });
  }
};

// Transfer asset between bases with logging
exports.transferAsset = async (req, res) => {
  const { asset_id, from_base_id, to_base_id, quantity, transfer_date } = req.body;
  const user_id = req.user.userId;

  try {
    await AssetModel.transferAsset(asset_id, from_base_id, to_base_id, quantity, transfer_date);

    await AssetModel.logAction(
      'Transfer',
      asset_id,
      quantity,
      from_base_id,
      transfer_date,
      user_id
    );

    res.status(201).json({ message: 'Asset transfer recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to record asset transfer.' });
  }
};

// Assign asset to personnel with logging
exports.assignAsset = async (req, res) => {
  const { asset_id, personnel_name, quantity, assigned_date } = req.body;
  const user_id = req.user.userId;

  try {
    await AssetModel.assignAsset(asset_id, personnel_name, quantity, assigned_date);

    await AssetModel.logAction(
      'Assignment',
      asset_id,
      quantity,
      null, // base_id not directly needed here
      assigned_date,
      user_id
    );

    res.status(201).json({ message: 'Asset assigned to personnel.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign asset.' });
  }
};

// Expend asset with logging
exports.expendAsset = async (req, res) => {
  const { asset_id, quantity, expended_date } = req.body;
  const user_id = req.user.userId;

  try {
    await AssetModel.expendAsset(asset_id, quantity, expended_date);

    await AssetModel.logAction(
      'Expenditure',
      asset_id,
      quantity,
      null,  // base_id not needed
      expended_date,
      user_id
    );

    res.status(201).json({ message: 'Asset expenditure recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to record asset expenditure.' });
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  const { base_id, from_date, to_date, type } = req.query;
  try {
    const stats = await AssetModel.getDashboardStats(base_id, from_date, to_date, type);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};

// Get all asset records
exports.getAssets = async (req, res) => {
  try {
    const result = await pool.query('SELECT asset_id, asset_name FROM assets');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Transfers with pagination
exports.getTransfers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT * FROM transfers ORDER BY transfer_date DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
};

// All assignments
exports.getAssignments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: 'Failed to fetch assignments.' });
  }
};

// All expenditures
exports.getExpenditures = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenditures');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenditures:', err);
    res.status(500).json({ message: 'Failed to fetch expenditures.' });
  }
};

// Audit logs
exports.getLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Failed to fetch logs.' });
  }
};
