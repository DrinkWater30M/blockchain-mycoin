var express = require('express');
var router = express.Router();
const exchangeController = require('../controller/exchangeController');

/* GET exchange page . */
router.get('/', exchangeController.getExchangepage);

/* send coin api. */
router.post('/api/coin/send', exchangeController.sendCoinToAddress);

module.exports = router;
