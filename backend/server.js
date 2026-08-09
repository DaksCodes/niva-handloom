const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware to parse JSON and enable CORS for your React frontend
app.use(cors());
app.use(express.json());

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Handloom API is running...');
});

const PORT = process.env.PORT || 5000;

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));