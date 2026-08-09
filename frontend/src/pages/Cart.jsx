import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const [deliveryMethod, setDeliveryMethod] = useState('Home Delivery');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartReady, setItemQuantity, removeItem, clearCart } = useCart();

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (deliveryMethod === 'Home Delivery' && !address.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          qty: item.qty,
          price: item.price,
        })),
        deliveryMethod,
        shippingAddress: deliveryMethod === 'Home Delivery' ? { address } : {},
        totalPrice,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post('https://niva-handloom-backend.onrender.com/api/orders', orderData, config);

      // Clear Cart on Success
      await clearCart();
      
      // Redirect to My Orders page
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (cartReady && cartItems.length === 0) {
    return (
      <div className="container empty-cart">
        <ShoppingBag size={64} className="empty-icon" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any bedsheets to your cart yet.</p>
        <Link to="/products" className="btn-primary">
          Explore Bedsheets
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2>Shopping Cart ({cartItems.length})</h2>

      {error && <div className="cart-error">{error}</div>}

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.product} className="cart-item-card">
              <img src={item.imageUrl} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price}</p>
              </div>

              <div className="qty-controls">
                <button onClick={() => setItemQuantity({ _id: item.product, name: item.name, imageUrl: item.imageUrl, price: item.price }, item.qty - 1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => setItemQuantity({ _id: item.product, name: item.name, imageUrl: item.imageUrl, price: item.price }, item.qty + 1)}>+</button>
              </div>

              <div className="cart-item-total">
                ₹{item.price * item.qty}
              </div>

              <button onClick={() => removeItem(item.product)} className="remove-btn">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Checkout Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="delivery-options">
            <label>Delivery Method:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="Home Delivery"
                  checked={deliveryMethod === 'Home Delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                Home Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="Self-Pickup"
                  checked={deliveryMethod === 'Self-Pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                Self-Pickup
              </label>
            </div>
          </div>

          {deliveryMethod === 'Home Delivery' && (
            <div className="address-field">
              <label>Shipping Address:</label>
              <textarea
                rows="3"
                placeholder="Enter complete house address, landmark, postal code..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          )}

          <div className="summary-row total-row">
            <span>Total Amount:</span>
            <span>₹{totalPrice}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn-primary checkout-btn"
          >
            {loading ? 'Placing Order...' : <>Place Order <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;