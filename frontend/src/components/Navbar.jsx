import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Heart, ShieldCheck, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Left: Brand Logo */}
        <Link to="/" className="nav-brand">
          <img src="/images/logo_compliment.png" alt="Niva Handlooms" className="brand-logo" />
        </Link>

        {/* Center: Navigation Links */}
        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link 
            to="/products" 
            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            Products
          </Link>

          {user && (
            <Link 
              to="/my-orders" 
              className={`nav-link flex-link ${location.pathname === '/my-orders' ? 'active' : ''}`}
            >
              <Package size={17} />
              <span>Orders</span>
            </Link>
          )}

          <Link 
            to="/cart" 
            className={`nav-link flex-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            <ShoppingCart size={17} />
            <span>Cart</span>
          </Link>

          <Link 
            to="/wishlist" 
            className={`nav-link flex-link ${location.pathname === '/wishlist' ? 'active' : ''}`}
          >
            <Heart size={17} />
            <span>Wishlist</span>
          </Link>

          {user && user.isAdmin && (
            <Link to="/admin" className="admin-badge-link">
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Right: User Profile & Logout */}
        <div className="nav-user-action">
          {user ? (
            <div className="user-profile">
              <span className="welcome-text">
                Hi, <strong>{user.name || 'Dakshita Agrawal'}</strong>
              </span>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;