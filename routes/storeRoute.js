var express = require('express');
var router = express.Router();
const storeController = require('../controller/storeController');

/* GET home page . */
router.get('/', storeController.getStorePage);

module.exports = router;
