const Product = require('../models/product');

const parseList = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

// @desc    Create a new product (Aunty / Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      companyName,
      oneLinerDescription,
      size,
      fabricType,
      type,
      price,
      originalPrice,
      discountedPrice,
      showDiscount,
      initialQuantity,
    } = req.body;

    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a product image' });
    }

    const basePrice = Number(price ?? originalPrice);
    const stockValue = Number(initialQuantity || 0);

    const product = new Product({
      category,
      name,
      companyName,
      oneLinerDescription,
      size,
      fabricType,
      type,
      price: basePrice,
      originalPrice: basePrice,
      discountedPrice: Number(discountedPrice),
      showDiscount: showDiscount === 'true' || showDiscount === true,
      initialQuantity: Number(initialQuantity),
      currentStock: Number(initialQuantity), // stock starts equal to initial quantity
      imageUrl: req.file.path, // Cloudinary image URL
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      category,
      name,
      companyName,
      oneLinerDescription,
      size,
      fabricType,
      type,
      price,
      originalPrice,
      discountedPrice,
      showDiscount,
      initialQuantity,
      currentStock,
    } = req.body;

    if (category !== undefined) product.category = category;
    if (name !== undefined) product.name = name;
    if (companyName !== undefined) product.companyName = companyName;
    if (oneLinerDescription !== undefined) product.oneLinerDescription = oneLinerDescription;
    if (size !== undefined) product.size = size;
    if (fabricType !== undefined) product.fabricType = fabricType;
    if (type !== undefined) product.type = type;
    const basePrice = price !== undefined ? Number(price) : originalPrice !== undefined ? Number(originalPrice) : product.price;
    if (basePrice !== undefined) {
      product.price = Number(basePrice);
      product.originalPrice = Number(basePrice);
    }
    if (discountedPrice !== undefined) product.discountedPrice = Number(discountedPrice);
    if (showDiscount !== undefined) {
      product.showDiscount = showDiscount === 'true' || showDiscount === true;
    }

    if (initialQuantity !== undefined) {
      product.initialQuantity = Number(initialQuantity);
    }

    if (currentStock !== undefined) {
      product.currentStock = Number(currentStock);
    }

    if (req.file) {
      product.imageUrl = req.file.path;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products with filtering & search (Customer view)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, size, fabricType, type, minPrice, maxPrice, search } = req.query;

    let query = {};

    const categories = parseList(category);
    const sizes = parseList(size);
    const fabrics = parseList(fabricType);
    const types = parseList(type);

    if (categories.length) {
      query.category = { $in: categories };
    }

    // Filter by Size (e.g., Single, Double)
    if (sizes.length) {
      query.size = { $in: sizes };
    }

    // Filter by Fabric
    if (fabrics.length) {
      query.fabricType = { $in: fabrics };
    }

    if (types.length) {
      query.type = { $in: types };
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);

      query.$or = [
        { price: priceQuery },
        { price: { $exists: false }, originalPrice: priceQuery },
      ];
    }

    // Search by product name or company
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
    .select('-initialQuantity') // Exclude initialQuantity from the response
    .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Aunty / Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct
};