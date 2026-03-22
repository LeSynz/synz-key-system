const router = require('express').Router();

router.get('/', (req, res) => {
    res.send('nothing to see here');
});

module.exports = router;