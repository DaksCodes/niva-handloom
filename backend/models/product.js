const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Bedsheet', 'Deewan Set']
  },
  name: { 
    type: String, 
    required: true 
  },
  companyName: { 
    type: String, 
    required: true 
  },
  oneLinerDescription: { 
    type: String, 
    required: true 
  },
  size: { 
    type: String, 
    required: true,
    enum: ['Single', 'Double', 'King', 'Queen'] // Standardizes options for the frontend filters
  },
  fabricType: { 
    type: String, 
    required: true,
    enum: ['Cotton', 'Glace Cotton', 'Linen', 'Polyester', 'Blended', 'Woolen']
  },
  type: {
    type: String,
    required: true,
    enum: ['Fitted', 'Flat', 'Reversible', 'Single Sided']
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: { 
    type: Number, 
    required: true 
  },
  discountedPrice: { 
    type: Number, 
    required: true 
  },
  showDiscount: { 
    type: Boolean, 
    default: false 
  },
  initialQuantity: { 
    type: Number, 
    required: true 
    // This is private data: how many she started with
  },
  currentStock: { 
    type: Number, 
    required: true 
    // This decreases on sale. If 0, frontend shows "Sold Out"
  },
  imageUrl: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);