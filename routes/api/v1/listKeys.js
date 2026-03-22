const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

router.get('/', validatePerms, async (req, res) => {
    try {
        const { status, note } = req.query;

        let query = 'SELECT id, key, hwid, note, created_at, expires_at, redeemed_at FROM keys';
        const conditions = [];
        const params = [];

        if (status === 'active') {
            conditions.push('expires_at > NOW()');
        } else if (status === 'expired') {
            conditions.push('expires_at <= NOW()');
        } else if (status === 'redeemed') {
            conditions.push('redeemed_at IS NOT NULL');
        }

        if (note) {
            params.push(`%${note}%`);
            conditions.push(`note ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        res.json({ success: true, count: result.rows.length, keys: result.rows });
    } catch (error) {
        console.error('Error listing keys:', error);
        res.status(500).json({ success: false, message: 'Failed to list keys.' });
    }
});

module.exports = router;
