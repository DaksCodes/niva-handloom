const Cart = require('../models/cart');

const normalizeCartItems = (items = []) =>
  items
    .map((item) => ({
      product: item.product,
      name: item.name,
      imageUrl: item.imageUrl,
      price: Number(item.price),
      qty: Number(item.qty),
    }))
    .filter((item) => item.product && item.name && item.imageUrl && item.price >= 0 && item.qty > 0);

// @desc    Get cart for logged-in user
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Replace cart items for logged-in user
// @route   PUT /api/cart
// @access  Private
const saveCart = async (req, res) => {
  try {
    const { items } = req.body;
    const normalizedItems = normalizeCartItems(items);

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, items: normalizedItems },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart for logged-in user
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  saveCart,
  clearCart,
};