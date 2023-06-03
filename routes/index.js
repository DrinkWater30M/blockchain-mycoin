var express = require('express');
var router = express.Router();
const homeRoute = require('./homeRoute');
const walletRoute = require('./walletRoute');
const storeRoute = require('./storeRoute');
const exchangeRoute = require('./exchangeRoute');
const historyRoute = require('./historyRoute');
const labController = require('../controller/labController');

// home
router.use('/', homeRoute);

// wallet
router.use('/wallet', walletRoute);

// wallet
router.use('/store', storeRoute);

// wallet
router.use('/exchange', exchangeRoute);

// wallet
router.use('/history', historyRoute);

// lab
router.get('/lab', labController.Test);


module.exports = router;
