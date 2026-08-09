import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import './Wishlist.css';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlistItems, wishlistReady } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data || []);
      } catch (error) {
        console.error('Failed to fetch products for wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const wishlistedProducts = useMemo(
    () => products.filter((product) => wishlistItems.includes(product._id)),
    [products, wishlistItems]
  );

  if (loading || !wishlistReady) {
    return <div className="container wishlist-page wishlist-loading">Loading wishlist...</div>;
  }

  return (
    <div className="container wishlist-page">
      <div className="wishlist-header">
        <div>
          <p className="wishlist-kicker">Saved for later</p>
          <h2>Your Wishlist ({wishlistedProducts.length})</h2>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={60} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any product to save it here across your devices.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;