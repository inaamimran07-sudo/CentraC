const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to run queries
const query = (text, params) => pool.query(text, params);

// Helper to get a single row
const get = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

// Helper to get all rows
const all = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

// Helper to run a query (insert/update/delete)
const run = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

module.exports = {
  query,
  get,
  all,
  run,
  pool
};
