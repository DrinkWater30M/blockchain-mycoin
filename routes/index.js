var express = require('express');
var router = express.Router();
const homeRoute = require('./homeRoute');
const walletRoute = require('./walletRoute');

// home
router.use('/', homeRoute);

// wallet
router.use('/wallet', walletRoute);


module.exports = router;
