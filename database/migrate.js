require('dotenv').config();
const db = require('./index');

async function migrate() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS keys (
                id SERIAL PRIMARY KEY,
                key VARCHAR(50) UNIQUE NOT NULL,
                hwid VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL,
                redeemed_at TIMESTAMP,
                note TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_keys_key ON keys (key);
            CREATE INDEX IF NOT EXISTS idx_keys_hwid ON keys (hwid);

            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(64) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_admins_username ON admins (username);
        `);

        console.log('Migration complete — tables ready.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
