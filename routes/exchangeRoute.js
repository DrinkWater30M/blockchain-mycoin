var express = require('express');
var router = express.Router();
const exchangeController = require('../controller/exchangeController');

/* GET home page . */
router.get('/', exchangeController.getExchangepage);

module.exports = router;
