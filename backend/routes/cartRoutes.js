const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCart, saveCart, clearCart } = require('../controllers/cartController');

router.route('/').get(protect, getCart).put(protect, saveCart).delete(protect, clearCart);

module.exports = router;