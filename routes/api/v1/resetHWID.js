const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

router.post('/', validatePerms, async (req, res) => {
    try {
        const { key, new_hwid } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key is required.' });
        }

        const result = await db.query('SELECT id FROM keys WHERE key = $1', [key]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Key not found.' });
        }

        if (new_hwid) {
            await db.query('UPDATE keys SET hwid = $1 WHERE id = $2', [new_hwid, result.rows[0].id]);
            res.json({ success: true, message: 'HWID updated successfully.' });
        } else {
            await db.query('UPDATE keys SET hwid = NULL, redeemed_at = NULL WHERE id = $1', [result.rows[0].id]);
            res.json({ success: true, message: 'HWID reset successfully.' });
        }
    } catch (error) {
        console.error('Error resetting HWID:', error);
        res.status(500).json({ success: false, message: 'Failed to reset HWID.' });
    }
});

module.exports = router;