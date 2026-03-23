const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

const logger = require('../../../utils/logger');

router.get('/', validatePerms, async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key query parameter is required.' });
        }

        const result = db.query(
            'SELECT id, key, hwid, note, created_at, expires_at, redeemed_at FROM keys WHERE key = $1',
            [key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Key not found.' });
        }

        const row = result.rows[0];
        res.json({
            success: true,
            key: {
                ...row,
                is_expired: new Date(row.expires_at) <= new Date(),
                is_redeemed: row.redeemed_at !== null,
            },
        });
    } catch (error) {
        logger.error('Error getting key:', error);
        res.status(500).json({ success: false, message: 'Failed to get key.' });
    }
});

module.exports = router;
