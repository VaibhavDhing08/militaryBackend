const pool = require('../config/db');

const User = {
  // Create a new user
  async createUser(username, passwordHash, role, base_id) {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role, base_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, passwordHash, role, base_id]
    );
    return result.rows[0];
  },

  // Find user by username
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
};

module.exports = User;
