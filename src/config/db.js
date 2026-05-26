const { Pool } = require('pg');
require('dotenv').config();

// Pool manages multiple database connections efficiently
// Instead of creating a new connection for every request,
// it reuses existing ones from the pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB
  }
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = pool;