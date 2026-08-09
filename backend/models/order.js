const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  deliveryMethod: { type: String, enum: ['Home Delivery', 'Self-Pickup'], required: true },
  shippingAddress: {
    address: { type: String }
    // Required only if Home Delivery
  },
  paymentStatus: { type: String, enum: ['Pending', 'Authorized', 'Captured', 'Paid'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Completed'], default: 'Requested' },
  isStockDeducted: {
    type: Boolean,
    default: false
  },
  isCustomerReceived: {
  type: Boolean,
  default: false
  },
  totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);