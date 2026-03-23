const db = require('../database');

module.exports = async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const hwid = req.header('x-hwid');
    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API key is missing.' });
    }
    try {
        const result = db.query('SELECT * FROM keys WHERE key = $1 AND expires_at > datetime(\'now\')', [apiKey]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid or expired API key.' });
        }

        const key = result.rows[0];

        if (!key.hwid) {
            if (!hwid) {
                return res.status(400).json({ success: false, message: 'HWID is required on first use.' });
            }
            db.query('UPDATE keys SET hwid = $1, redeemed_at = datetime(\'now\') WHERE id = $2', [hwid, key.id]);
            key.hwid = hwid;
        } else if (key.hwid !== hwid) {
            return res.status(403).json({ success: false, message: 'Key is bound to another device.' });
        }

        req.apiKey = key;
        next();
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({ success: false, message: 'Failed to validate API key.' });
    }
}