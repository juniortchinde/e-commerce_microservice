const router = require('express').Router();
const orderController = require('../controllers/Order.controller');

router.post("/createOrder", orderController.createOrder);

module.exports = router;