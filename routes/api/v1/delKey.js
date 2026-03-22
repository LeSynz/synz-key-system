const router = require('express').Router();
const db = require('../../../database');
const validatePerms = require('../../../middleware/validatePerms');

router.post('/', validatePerms, async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key is required.' });
        }

        const result = await db.query('SELECT id FROM keys WHERE key = $1', [key]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Key not found.' });
        }

        await db.query('DELETE FROM keys WHERE id = $1', [result.rows[0].id]);
        res.json({ success: true, message: 'Key deleted successfully.' });
    } catch (error) {
        console.error('Error deleting key:', error);
        res.status(500).json({ success: false, message: 'Failed to delete key.' });
    }
});

module.exports = router;