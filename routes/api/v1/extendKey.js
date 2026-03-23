const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');
const { admin } = require('../../../middleware/rateLimit');

const logger = require('../../../utils/logger');

router.post('/', admin, validatePerms, async (req, res) => {
    try {
        const { key, days } = req.body;
        if (!key || !days) {
            return res.status(400).json({ success: false, message: 'Key and days are required.' });
        }

        const result = db.query('SELECT id, expires_at FROM keys WHERE key = $1', [key]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Key not found.' });
        }

        const current = new Date(result.rows[0].expires_at);
        const base = current > new Date() ? current : new Date();
        const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

        db.query('UPDATE keys SET expires_at = $1 WHERE id = $2', [newExpiry.toISOString(), result.rows[0].id]);
        logger.success(`Key "${key}" extended successfully.`);

        res.json({ success: true, message: 'Key extended successfully.', expires_at: newExpiry });
    } catch (error) {
        logger.error('Error extending key:', error);
        res.status(500).json({ success: false, message: 'Failed to extend key.' });
    }
});

module.exports = router;
