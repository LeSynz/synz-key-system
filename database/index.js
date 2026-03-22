const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    connectionString: config.databaseUrl,
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
