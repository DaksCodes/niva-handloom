import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const availableStock = Math.max(Number(product.currentStock) || 0, 0);
const isSoldOut = availableStock <= 0;
  const [qty, setQty] = useState(0);
  const { user } = useAuth();
  const { cartItems, cartReady, addItem, setItemQuantity, getItemQuantity } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    setQty(getItemQuantity(product._id));
  }, [cartItems, cartReady, getItemQuantity, product._id]);

  const addToCart = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (isSoldOut || qty >= availableStock) {
    return;
  }

  if (user?.token) {
    await addItem(product);
  } else {
    const nextQty = qty > 0 ? qty + 1 : 1;
    const cappedQty = Math.min(nextQty, availableStock);
    await setItemQuantity(product, cappedQty);
  }
};

  const changeQty = async (e, delta) => {
  e.preventDefault();
  e.stopPropagation();

  if (isSoldOut) {
    return;
  }

  const nextQty = Math.min(Math.max(qty + delta, 0), availableStock);
  await setItemQuantity(product, nextQty);
};

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleItem(product);
  };

  return (
    <div className={`product-card ${isSoldOut ? 'sold-out-card' : ''}`}>
      <Link to={`/product/${product._id}`} className="card-link">
        <div className="image-container">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Bedsheet'} 
            alt={product.name} 
          />
          {isSoldOut && <div className="sold-out-badge">SOLD OUT</div>}

          <button
            type="button"
            className={`quick-wishlist-btn ${isWishlisted(product._id) ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
          </button>

          {!isSoldOut && (
            <button
              type="button"
              className={`quick-cart-btn ${qty > 0 ? 'active' : ''}`}
              onClick={addToCart}
              aria-label={qty > 0 ? 'Increase quantity' : 'Add to cart'}
              title={qty > 0 ? 'Increase quantity' : 'Add to cart'}
            >
              <ShoppingCart size={16} />
              {qty > 0 ? qty : ''}
            </button>
          )}
        </div>

        <div className="card-info">
          <p className="company-name">{product.companyName || 'Niva Handlooms'}</p>
          <h3 className="product-title">{product.name}</h3>
          
          <div className="product-tags">
            <span className="tag">{product.size}</span>
            <span className="tag">{product.fabricType}</span>
          </div>

          <div className="price-section">
            {product.showDiscount && product.discountedPrice ? (
              <>
                <span className="discounted-price">₹{product.discountedPrice}</span>
                <span className="original-price strikethrough">₹{product.originalPrice}</span>
              </>
            ) : (
              <span className="normal-price">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      {qty > 0 && !isSoldOut && (
        <div className="card-qty-bar">
          <button type="button" className="qty-btn" onClick={(e) => changeQty(e, -1)} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>

          <span className="qty-value">{qty}</span>

          <button type="button" className="qty-btn" onClick={(e) => changeQty(e, 1)} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;