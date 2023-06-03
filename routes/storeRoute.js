var express = require('express');
var router = express.Router();
const storeController = require('../controller/storeController');

/* GET store page . */
router.get('/', storeController.getStorePage);

/* api buy coin from store . */
router.post('/api/coin/buy', storeController.buyCoin);

module.exports = router;
