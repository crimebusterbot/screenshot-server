const express = require('express');
const router = express.Router();

const screenshot = require('./screenshot/screenshot');

// Stel CORS in
router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://screenshot.api.webshop-checker.nl');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.get('/', (req, res) => {
    screenshot.make(req.query.u, res);
});

// All other routes get 404.
router.get('*', (req, res) => {
    res.status(404);
    res.send({success: false, message: 'This URL can not be found on the API, try a valid route.'});
});

module.exports = router;