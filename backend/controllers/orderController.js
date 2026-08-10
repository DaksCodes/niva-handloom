const Order = require('../models/order');
const Product = require('../models/product');
const { sendAdminOrderEmail } = require('../utils/sendEmail');
const { sendAdminSms } = require('../utils/sendSms');
const normalizeOrder = (order) => {
  if (!order) {
    return order;
  }

  const normalizedOrder = order.toObject ? order.toObject() : { ...order };

  if (normalizedOrder.orderStatus === 'Complete') {
    normalizedOrder.orderStatus = 'Completed';
  }

  return normalizedOrder;
};

// @desc    Create new order (Customer Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, deliveryMethod, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      '_id name currentStock showDiscount discountedPrice originalPrice price'
    );

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const issues = [];
    const sanitizedItems = [];
    let computedTotal = 0;

    for (const item of orderItems) {
      const productId = String(item.product);
      const qty = Number(item.qty);
      const product = productMap.get(productId);

      if (!product) {
        issues.push({ productId, message: 'Product not found' });
        continue;
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        issues.push({ productId, productName: product.name, message: 'Invalid quantity' });
        continue;
      }

      const stock = Number(product.currentStock || 0);

      if (stock <= 0) {
        issues.push({ productId, productName: product.name, message: 'Sold out' });
        continue;
      }

      if (qty > stock) {
        issues.push({
          productId,
          productName: product.name,
          message: 'Requested quantity exceeds stock',
          availableStock: stock,
        });
        continue;
      }

      const finalPrice =
        product.showDiscount && Number(product.discountedPrice) > 0
          ? Number(product.discountedPrice)
          : Number(product.originalPrice ?? product.price ?? 0);

      sanitizedItems.push({
        product: product._id,
        qty,
        price: finalPrice,
      });

      computedTotal += finalPrice * qty;
    }

    if (issues.length > 0) {
      return res.status(400).json({
        message: 'Some items are unavailable or out of stock',
        issues,
      });
    }

    if (sanitizedItems.length === 0) {
      return res.status(400).json({ message: 'No valid order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems: sanitizedItems,
      deliveryMethod,
      shippingAddress: deliveryMethod === 'Home Delivery' ? shippingAddress : {},
      totalPrice: computedTotal,
      orderStatus: 'Requested',
      paymentStatus: 'Pending',
    });

    const createdOrder = await order.save();

    try {
      await createdOrder.populate('user', 'name email');
      await createdOrder.populate('orderItems.product', 'name price');
      sendAdminOrderEmail(createdOrder);
      // sendAdminSms(createdOrder);
    } catch (emailError) {
      console.error('Order created but failed to send email:', emailError);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get logged in user orders (Customer view)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Aunty / Admin View)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order & payment status (Aunty Approve/Reject/Complete)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'Requested') {
      return res.status(400).json({ message: 'Order status can only be changed while it is Requested' });
    }

    if (!['Approved', 'Rejected'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Order status must be Approved or Rejected' });
    }

    if (orderStatus === 'Approved' && !order.isStockDeducted) {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product).select('name currentStock');

    if (!product) {
      return res.status(400).json({ message: 'One or more ordered products no longer exist' });
    }

    if (Number(product.currentStock || 0) < Number(item.qty)) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}`,
      });
    }
  }

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { currentStock: -Number(item.qty) },
    });
  }

  order.isStockDeducted = true;
}

    order.orderStatus = orderStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer marks product as received
// @route   PUT /api/orders/:id/receive
// @access  Private (Customer)
const markOrderReceivedByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure only the owner customer can mark it received
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.orderStatus !== 'Approved') {
      return res.status(400).json({ message: 'Order can only be marked received after it is Approved' });
    }

    if (order.isCustomerReceived) {
      return res.status(400).json({ message: 'Order has already been marked as received' });
    }

    order.isCustomerReceived = true;
    order.orderStatus = 'Completed';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderReceivedByCustomer
};