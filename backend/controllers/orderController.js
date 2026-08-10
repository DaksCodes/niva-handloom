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
    const { orderItems, deliveryMethod, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      deliveryMethod, // 'Home Delivery' or 'Self-Pickup'
      shippingAddress: deliveryMethod === 'Home Delivery' ? shippingAddress : {},
      totalPrice,
      orderStatus: 'Requested',
      paymentStatus: 'Pending',
    });

    const createdOrder = await order.save();
    try {
      // User ki details (naam, email) aur Product ki details email ke liye nikal rahe hain
      await createdOrder.populate('user', 'name email');
      await createdOrder.populate('orderItems.product', 'name price');
      
      // Email bhejein (bina await ke taaki api response slow na ho)
      sendAdminOrderEmail(createdOrder);
      // sendAdminSms(createdOrder);
    } catch (emailError) {
      console.error('Order ban gaya par email bhejne mein error aayi:', emailError);
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
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            currentStock: -item.qty,
          }
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