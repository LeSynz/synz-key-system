const db = require('../database');
const crypto = require('crypto');

const logger = require('../utils/logger');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async (req, res, next) => {
    const username = req.header('x-admin-user');
    const password = req.header('x-admin-pass');

    if (!username || !password) {
        return res.status(401).json({ success: false, message: 'Admin credentials are required.' });
    }

    try {
        const result = db.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const admin = result.rows[0];
        if (admin.password_hash !== hashPassword(password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        logger.error('Error validating admin:', error);
        res.status(500).json({ success: false, message: 'Failed to validate credentials.' });
    }
};
