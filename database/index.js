const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Compatibility wrapper: converts pg-style $1,$2 placeholders to ? and
// returns { rows: [...] } so existing code doesn't need to change.
function query(text, params = []) {
    const converted = text.replace(/\$(\d+)/g, '?');
    const trimmed = converted.trim();

    if (/^(SELECT|PRAGMA)/i.test(trimmed)) {
        const rows = db.prepare(trimmed).all(...params);
        return { rows };
    } else {
        const info = db.prepare(trimmed).run(...params);
        return { rows: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
}

module.exports = { query, db };
