const router = require('express').Router();

router.get('/', (req, res) => {
    res.status(404).json({
        success: false,
        message: "🤡 You lost? The real API lives at /api/v1 - this ain't it chief."
    });
});

module.exports = router;
