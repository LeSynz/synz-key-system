const router = require('express').Router();
const db = require('../../../database');
const validateKey = require('../../../middleware/validateKey');
const { strict } = require('../../../middleware/rateLimit');

router.post('/', strict, validateKey, async (req, res) => {
    res.json({ success: true, message: 'Key is valid.' });
})


module.exports = router;