const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');
const { admin } = require('../../../middleware/rateLimit');

const logger = require('../../../utils/logger');

router.get('/', admin, validatePerms, async (req, res) => {
    try {
        const { status, note } = req.query;

        let query = 'SELECT id, key, hwid, note, created_at, expires_at, redeemed_at FROM keys';
        const conditions = [];
        const params = [];

        if (status === 'active') {
            conditions.push('expires_at > datetime(\'now\')');
        } else if (status === 'expired') {
            conditions.push('expires_at <= datetime(\'now\')');
        } else if (status === 'redeemed') {
            conditions.push('redeemed_at IS NOT NULL');
        }

        if (note) {
            params.push(`%${note}%`);
            conditions.push(`note LIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const result = db.query(query, params);
        res.json({ success: true, count: result.rows.length, keys: result.rows });
    } catch (error) {
        logger.error('Error listing keys:', error);
        res.status(500).json({ success: false, message: 'Failed to list keys.' });
    }
});

module.exports = router;
