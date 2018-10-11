const express = require('express');
const router = express.Router();

const screenshot = require('./screenshot/screenshot');

// Stel CORS in
router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.get('/screenshot', (req, res) => {
    screenshot.make(req.query.u, res);
});

module.exports = router;