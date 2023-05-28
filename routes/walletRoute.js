var express = require('express');
var router = express.Router();
const walletController = require('../controller/walletController');

/* GET home page . */
router.get('/', walletController.getWalletPage);

module.exports = router;
