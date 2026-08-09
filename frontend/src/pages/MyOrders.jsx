import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Check, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck,
  ShoppingBag,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('https://niva-handloom-backend.onrender.com/api/orders/myorders', config);
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const handleMarkReceived = async (orderId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(`https://niva-handloom-backend.onrender.com/api/orders/${orderId}/receive`, {}, config);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, isCustomerReceived: true, orderStatus: 'Completed' } : order
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update order status.');
    }
  };

  if (loading) {
    return (
      <div className="orders-container loading-wrapper">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container empty-orders">
        <div className="empty-icon-circle">
          <ShoppingBag size={48} />
        </div>
        <h2>No Orders Yet</h2>
        <p>Looks like you haven't ordered any handloom collections yet.</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>My Orders</h2>
        <p className="subtitle">Track and manage your recent bedsheet purchases</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const currentStatus = order.orderStatus || 'Requested';

          return (
            <div key={order._id} className="order-horizontal-card">
              
              {/* Top Bar: ID, Date & Status */}
              <div className="card-top-bar">
                <div className="order-meta">
                  <span className="order-id-badge">
                    <Package size={16} /> #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="order-date">
                    <Calendar size={15} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className={`status-pill ${currentStatus.toLowerCase()}`}>
                  {currentStatus === 'Requested' && <Clock size={15} />}
                  {currentStatus === 'Approved' && <Check size={15} />}
                  {currentStatus === 'Rejected' && <XCircle size={15} />}
                  {currentStatus === 'Completed' && <CheckCircle2 size={15} />}
                  <span>{currentStatus}</span>
                </div>
              </div>

              {/* Main Card Content */}
              <div className="card-body">
                
                {/* Left: Purchased Items */}
                <div className="items-section">
                  <div className="section-title">Items Ordered</div>
                  <div className="items-list">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-name">{item.product?.name || item.name || 'Bedsheet'}</span>
                        <span className="item-qty">x{item.qty}</span>
                        <span className="item-price">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle: Delivery & Payment Info */}
                <div className="info-section">
                  <div className="info-block">
                    <Truck size={16} className="info-icon" />
                    <div>
                      <div className="info-label">Delivery Method</div>
                      <div className="info-value">{order.deliveryMethod}</div>
                    </div>
                  </div>

                  {order.deliveryMethod === 'Home Delivery' && (
                    <div className="info-block">
                      <MapPin size={16} className="info-icon" />
                      <div>
                        <div className="info-label">Address</div>
                        <div className="info-value address-text">{order.shippingAddress?.address || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  <div className="info-block">
                    <CreditCard size={16} className="info-icon" />
                    <div>
                      <div className="info-label">Payment Status</div>
                      <div className="payment-pill">
                        {order.paymentStatus || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Total & Action */}
                <div className="action-section">
                  <div className="total-box">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">₹{order.totalPrice}</span>
                  </div>

                  {currentStatus === 'Approved' && !order.isCustomerReceived && (
                    <button 
                      onClick={() => handleMarkReceived(order._id)} 
                      className="mark-received-btn"
                    >
                      <CheckSquare size={16} /> Mark as Received
                    </button>
                  )}

                  {(order.isCustomerReceived || currentStatus === 'Completed') && (
                    <div className="received-tag">
                      <CheckCircle2 size={16} /> Delivered & Received
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;