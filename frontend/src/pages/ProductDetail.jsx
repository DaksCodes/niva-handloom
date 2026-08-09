import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`https://niva-handloom-backend.onrender.com/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    await addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = async () => {
    await toggleItem(product);
  };

  if (loading) return <div className="container detail-loading">Loading details...</div>;
  if (!product) return <div className="container detail-loading">Product not found.</div>;

  const isSoldOut = product.currentStock === 0;

  return (
    <div className="container product-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Back to Products
      </button>

      <div className="detail-card">
        <div className="detail-image-box">
          <img src={product.imageUrl} alt={product.name} />
          {isSoldOut && <div className="detail-sold-out-badge">SOLD OUT</div>}

          <button
            type="button"
            className={`detail-wishlist-btn ${isWishlisted(product._id) ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="detail-content">
          <p className="detail-company">{product.companyName}</p>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-box">
            {product.showDiscount && product.discountedPrice ? (
              <>
                <span className="detail-discounted">₹{product.discountedPrice}</span>
                <span className="detail-original strikethrough">₹{product.originalPrice}</span>
              </>
            ) : (
              <span className="detail-normal">₹{product.originalPrice}</span>
            )}
          </div>

          <p className="detail-description">{product.oneLinerDescription}</p>

          <div className="detail-specs">
            <div><strong>Size:</strong> {product.size}</div>
            <div><strong>Fabric:</strong> {product.fabricType}</div>
          </div>

          <button
            onClick={addToCart}
            disabled={isSoldOut}
            className={`btn-primary add-cart-btn ${isSoldOut ? 'disabled' : ''}`}
          >
            {added ? (
              <><Check size={20} /> Added to Cart!</>
            ) : isSoldOut ? (
              'Currently Out of Stock'
            ) : (
              <><ShoppingCart size={20} /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;