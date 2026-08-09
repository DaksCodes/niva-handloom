const Wishlist = require('../models/wishlist');

const normalizeWishlistItems = (items = []) =>
  [...new Set(items.map((item) => (item && typeof item === 'object' ? item.product || item._id : item)).filter(Boolean).map(String))];

// @desc    Get wishlist for logged-in user
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.json({ user: req.user._id, items: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Replace wishlist items for logged-in user
// @route   PUT /api/wishlist
// @access  Private
const saveWishlist = async (req, res) => {
  try {
    const { items } = req.body;
    const normalizedItems = normalizeWishlistItems(items);

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, items: normalizedItems },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear wishlist for logged-in user
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  saveWishlist,
  clearWishlist,
};