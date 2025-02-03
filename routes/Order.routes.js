const router = require('express').Router();
const orderController = require('../controllers/Order.controller');
const payment = require('../middlewares/payment');
const auth = require('../middlewares/auth');

router.post("/createOrder",auth.protect, payment.payOrder, orderController.createOrder);

module.exports = router;