var express = require('express');
var router = express.Router();
const homeController = require('../controller/homeController');

/* GET login page . */
router.get('/', homeController.getLoginPage);

/* GET register page . */
router.get('/register', homeController.getRegisterPage);

module.exports = router;
