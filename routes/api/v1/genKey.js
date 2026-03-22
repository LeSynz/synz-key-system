const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');
const v4 = require('uuid').v4;

router.post('/', validatePerms, async (req, res) => {
    try {
        const { name, expires_in } = req.body;
        if (!name || !expires_in) {
            return res.status(400).json({ success: false, message: 'Name and expires_in are required.' });
        }
        // get date of now + expires_in days
        const expiresAt = new Date(Date.now() + expires_in * 24 * 60 * 60 * 1000);
        const key = 'SYNZ-' + v4().toUpperCase();

        const existing = await db.query('SELECT id FROM keys WHERE note = $1', [name]);
        if (existing.rows.length > 0) {
            await db.query('UPDATE keys SET key = $1, expires_at = $2, hwid = NULL, redeemed_at = NULL WHERE id = $3', [key, expiresAt, existing.rows[0].id]);
        } else {
            await db.query('INSERT INTO keys (key, expires_at, note) VALUES ($1, $2, $3)', [key, expiresAt, name]);
        }
        res.json({ success: true, key });
    } catch (error) {
        console.error('Error generating key:', error);
        res.status(500).json({ success: false, message: 'Failed to generate key.' });
    }
})

module.exports = router;