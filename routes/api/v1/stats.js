const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

router.get('/', validatePerms, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE expires_at > NOW())::int AS active,
                COUNT(*) FILTER (WHERE expires_at <= NOW())::int AS expired,
                COUNT(*) FILTER (WHERE redeemed_at IS NOT NULL)::int AS redeemed
            FROM keys
        `);

        res.json({ success: true, stats: result.rows[0] });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
});

module.exports = router;
