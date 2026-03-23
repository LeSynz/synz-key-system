const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
}