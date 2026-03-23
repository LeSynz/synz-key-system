const { db } = require('./index');
const logger = require('./utils/logger');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            hwid TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT NOT NULL,
            redeemed_at TEXT,
            note TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_keys_key ON keys (key);
        CREATE INDEX IF NOT EXISTS idx_keys_hwid ON keys (hwid);

        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_admins_username ON admins (username);
    `);

    logger.success('Migration complete — tables ready.');
} catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
}
