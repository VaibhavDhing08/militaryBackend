const pool = require('../config/db');

const AssetModel = {
  async addPurchase(asset_name, type, base_id, quantity, purchased_on) {
    await pool.query(
      'INSERT INTO assets (asset_name, type, base_id, quantity, purchased_on) VALUES ($1, $2, $3, $4, $5)',
      [asset_name, type, base_id, quantity, purchased_on]
    );
  },

  async getPurchases() {
    const result = await pool.query('SELECT * FROM assets');
    return result.rows;
  },

  async transferAsset(asset_id, from_base_id, to_base_id, quantity, transfer_date) {
    await pool.query(
      'INSERT INTO transfers (asset_id, from_base_id, to_base_id, quantity, transfer_date) VALUES ($1, $2, $3, $4, $5)',
      [asset_id, from_base_id, to_base_id, quantity, transfer_date]
    );
  },

  async assignAsset(asset_id, personnel_name, quantity, assigned_date) {
    await pool.query(
      'INSERT INTO assignments (asset_id, personnel_name, quantity, assigned_date) VALUES ($1, $2, $3, $4)',
      [asset_id, personnel_name, quantity, assigned_date]
    );
  },

  async expendAsset(asset_id, quantity, expended_date) {
    await pool.query(
      'INSERT INTO expenditures (asset_id, quantity, expended_date) VALUES ($1, $2, $3)',
      [asset_id, quantity, expended_date]
    );
  },

  async logAction(action_type, asset_id, quantity, base_id, action_date, user_id) {
    await pool.query(
      'INSERT INTO asset_logs (action_type, asset_id, quantity, base_id, action_date, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [action_type, asset_id, quantity, base_id, action_date, user_id]
    );
  },

  async getDashboardStats(base_id, from_date, to_date, type) {
    let openingQuery = 'SELECT COALESCE(SUM(quantity), 0) AS opening_balance FROM assets WHERE base_id = $1';
    const openingParams = [base_id];

    if (from_date) {
      openingParams.push(from_date);
      openingQuery += ` AND purchased_on < $${openingParams.length}`;
    }
    if (type) {
      openingParams.push(type);
      openingQuery += ` AND type = $${openingParams.length}`;
    }

    const openingResult = await pool.query(openingQuery, openingParams);

    let transferInQuery = 'SELECT COALESCE(SUM(quantity), 0) AS transfer_in FROM transfers WHERE to_base_id = $1';
    const transferInParams = [base_id];

    if (from_date) {
      transferInParams.push(from_date);
      transferInQuery += ` AND transfer_date >= $${transferInParams.length}`;
    }
    if (to_date) {
      transferInParams.push(to_date);
      transferInQuery += ` AND transfer_date <= $${transferInParams.length}`;
    }
    if (type) {
      transferInParams.push(type);
      transferInQuery += ` AND asset_id IN (SELECT asset_id FROM assets WHERE type = $${transferInParams.length})`;
    }

    const transferInResult = await pool.query(transferInQuery, transferInParams);

    let transferOutQuery = 'SELECT COALESCE(SUM(quantity), 0) AS transfer_out FROM transfers WHERE from_base_id = $1';
    const transferOutParams = [base_id];

    if (from_date) {
      transferOutParams.push(from_date);
      transferOutQuery += ` AND transfer_date >= $${transferOutParams.length}`;
    }
    if (to_date) {
      transferOutParams.push(to_date);
      transferOutQuery += ` AND transfer_date <= $${transferOutParams.length}`;
    }
    if (type) {
      transferOutParams.push(type);
      transferOutQuery += ` AND asset_id IN (SELECT asset_id FROM assets WHERE type = $${transferOutParams.length})`;
    }

    const transferOutResult = await pool.query(transferOutQuery, transferOutParams);

    let purchaseQuery = 'SELECT COALESCE(SUM(quantity), 0) AS purchases FROM assets WHERE base_id = $1';
    const purchaseParams = [base_id];

    if (from_date) {
      purchaseParams.push(from_date);
      purchaseQuery += ` AND purchased_on >= $${purchaseParams.length}`;
    }
    if (to_date) {
      purchaseParams.push(to_date);
      purchaseQuery += ` AND purchased_on <= $${purchaseParams.length}`;
    }
    if (type) {
      purchaseParams.push(type);
      purchaseQuery += ` AND type = $${purchaseParams.length}`;
    }

    const purchaseResult = await pool.query(purchaseQuery, purchaseParams);

    const openingBalance = parseInt(openingResult.rows[0].opening_balance || 0);
    const transferIn = parseInt(transferInResult.rows[0].transfer_in || 0);
    const transferOut = parseInt(transferOutResult.rows[0].transfer_out || 0);
    const purchases = parseInt(purchaseResult.rows[0].purchases || 0);

    const netMovement = purchases + transferIn - transferOut;
    const closingBalance = openingBalance + netMovement;

    return {
      opening_balance: openingBalance,
      transfer_in: transferIn,
      transfer_out: transferOut,
      purchases: purchases,
      net_movement: netMovement,
      closing_balance: closingBalance
    };
  }
};

module.exports = AssetModel;
