import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, RotateCcw } from 'lucide-react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);

  const availableCategories = ['Bedsheet', 'Deewan Set'];
  const availableSizes = ['Single', 'Double', 'King', 'Queen'];
  const availableFabrics = ['Cotton', 'Glace Cotton', 'Linen', 'Polyester', 'Blended', 'Woolen'];
  const availableTypes = ['Fitted', 'Flat', 'Reversible', 'Single Sided'];

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic (Runs whenever filter state changes)
  useEffect(() => {
    let result = products;

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => selectedSizes.includes(p.size));
    }

    // Fabric Filter
    if (selectedFabrics.length > 0) {
      result = result.filter((p) => selectedFabrics.includes(p.fabricType));
    }

    if (selectedTypes.length > 0) {
      result = result.filter((p) => selectedTypes.includes(p.type));
    }

    // Price Filter
    result = result.filter((p) => {
      const finalPrice = p.price ?? (p.showDiscount && p.discountedPrice ? p.discountedPrice : p.originalPrice);
      const meetsMin = minPrice === '' ? true : finalPrice >= Number(minPrice);
      return meetsMin && finalPrice <= maxPrice;
    });

    setFilteredProducts(result);
  }, [selectedCategories, selectedSizes, selectedFabrics, selectedTypes, minPrice, maxPrice, products]);

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleFabricChange = (fabric) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice(5000);
  };

  return (
    <div className="container products-page">
      {/* Sidebar Filters */}
      <aside className="filters-sidebar">
        <div className="filter-header">
          <h3><Filter size={18} /> Filters</h3>
          <button onClick={resetFilters} className="reset-btn">
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <h4>Category</h4>
          {availableCategories.map((category) => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
                  )
                }
              />
              <span>{category}</span>
            </label>
          ))}
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <h4>Price Range</h4>
          <label className="checkbox-label">
            <span>Minimum</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </label>
          <h4>Max Price: ₹{maxPrice}</h4>
          <input
            type="range"
            min="300"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="price-slider"
          />
        </div>

        {/* Size Filter */}
        <div className="filter-group">
          <h4>Size</h4>
          {availableSizes.map((size) => (
            <label key={size} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeChange(size)}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>

        {/* Fabric Filter */}
        <div className="filter-group">
          <h4>Fabric Type</h4>
          {availableFabrics.map((fabric) => (
            <label key={fabric} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedFabrics.includes(fabric)}
                onChange={() => handleFabricChange(fabric)}
              />
              <span>{fabric}</span>
            </label>
          ))}
        </div>

        {/* Type Filter */}
        <div className="filter-group">
          <h4>Type</h4>
          {availableTypes.map((type) => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() =>
                  setSelectedTypes((prev) =>
                    prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
                  )
                }
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Product Grid */}
      <main className="products-main">
        <div className="grid-header">
          <h2>All Bedsheets ({filteredProducts.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">Loading Bedsheets...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">No bedsheets match your selected filters.</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;