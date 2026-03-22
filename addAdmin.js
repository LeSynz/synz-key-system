require('dotenv').config();
const db = require('./database');
const crypto = require('crypto');

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error('Usage: node addAdmin.js <username> <password>');
    process.exit(1);
}

async function addAdmin() {
    try {
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        await db.query(
            'INSERT INTO admins (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = $2',
            [username, hash]
        );
        console.log(`Admin "${username}" created successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to create admin:', err);
        process.exit(1);
    }
}

addAdmin();
