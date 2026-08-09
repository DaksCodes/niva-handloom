const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWishlist, saveWishlist, clearWishlist } = require('../controllers/wishlistController');

router.route('/').get(protect, getWishlist).put(protect, saveWishlist).delete(protect, clearWishlist);

module.exports = router;