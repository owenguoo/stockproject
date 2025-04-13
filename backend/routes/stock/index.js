const express = require('express');
const router = express.Router();
const { getStockQuote } = require('./stockController');

router.get('/quote/:symbol', getStockQuote);

module.exports = router;
