const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

router.get('/', validatePerms, async (req, res) => {
    try {
        const result = db.query(`
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN expires_at > datetime('now') THEN 1 ELSE 0 END), 0) AS active,
                COALESCE(SUM(CASE WHEN expires_at <= datetime('now') THEN 1 ELSE 0 END), 0) AS expired,
                COALESCE(SUM(CASE WHEN redeemed_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS redeemed
            FROM keys
        `);

        res.json({ success: true, stats: result.rows[0] });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
});

module.exports = router;
