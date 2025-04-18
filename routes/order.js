const express = require('express');
const router = express.Router();
const { getUserOrders, getAllOrders, saveOrder } = require('../controller/orderController');

router.get('/all', getAllOrders); 
router.get('/my-orders', getUserOrders); 
router.post('/save', saveOrder);


module.exports = router;

