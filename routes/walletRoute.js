var express = require('express');
var router = express.Router();
const walletController = require('../controller/walletController');

/* GET wallet page . */
router.get('/', walletController.getWalletPage);

/* create wallet api . */
router.get('/api/private-key/create', walletController.createNewWallet);

module.exports = router;
