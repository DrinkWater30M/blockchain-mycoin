var express = require('express');
var router = express.Router();
const historyController = require('../controller/historyController');

/* GET home page . */
router.get('/', historyController.getHistoryPage);

module.exports = router;
