const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public: Get all products | Admin: Create product with image upload
router
  .route('/')
  .get(getProducts)
  .post(protect, admin, upload.single('image'), createProduct);

// Public: Get product by ID | Admin: Delete product
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;