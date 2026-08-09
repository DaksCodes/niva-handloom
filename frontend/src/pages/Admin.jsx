import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Package, ShoppingBag, Edit3, Save, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    category: 'Bedsheet',
    name: '',
    companyName: 'Niva Handlooms',
    oneLinerDescription: '',
    type: 'Fitted',
    price: '',
    originalPrice: '',
    discountedPrice: '',
    showDiscount: false,
    size: 'Double',
    fabricType: 'Cotton',
    currentStock: 10,
    // imageUrl: '',
    imageFile: null,
    imagePreview: '',
    oneLinerDescription: '',
  });

  // Editing Stock State
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStock, setTempStock] = useState(0);

  const { user } = useAuth();

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${user?.token || ''}`,
    },
  });

  const openEditProduct = (product) => {
    setEditingProductId(product._id);
    setEditProduct({
      category: product.category || 'Bedsheet',
      name: product.name || '',
      companyName: product.companyName || '',
      oneLinerDescription: product.oneLinerDescription || '',
      type: product.type || 'Fitted',
      size: product.size || 'Double',
      fabricType: product.fabricType || 'Cotton',
      price: product.price ?? product.originalPrice ?? '',
      originalPrice: product.originalPrice ?? '',
      discountedPrice: product.discountedPrice ?? '',
      showDiscount: !!product.showDiscount,
      currentStock: product.currentStock ?? 0,
    });
  };

  const closeEditProduct = () => {
    setEditingProductId(null);
    setEditProduct(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError('');

      // Fetch Products
      const prodRes = await axios.get('http://localhost:5000/api/products');
      setProducts(prodRes.data || []);

      // Fetch Orders
      if (user?.token) {
        const orderRes = await axios.get('http://localhost:5000/api/orders', getAuthConfig());
        setOrders(orderRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setApiError(err.response?.data?.message || 'Failed to fetch Admin Data from Server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateProduct = async () => {
    if (!editingProductId || !editProduct) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProductId}`,
        {
          ...editProduct,
          originalPrice: Number(editProduct.originalPrice),
          discountedPrice: Number(editProduct.discountedPrice || 0),
          currentStock: Number(editProduct.currentStock),
        },
        getAuthConfig()
      );

      closeEditProduct();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  // Add Product Handler
  const handleAddProduct = async (e) => {
  e.preventDefault();

  if (!newProduct.imageFile) {
    alert('Please select an image first!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('category', newProduct.category);
    formData.append('name', newProduct.name);
    formData.append('companyName', newProduct.companyName);
    formData.append('oneLinerDescription', newProduct.oneLinerDescription);
    formData.append('type', newProduct.type);
    formData.append('size', newProduct.size);
    formData.append('fabricType', newProduct.fabricType);
    formData.append('price', newProduct.price);
    formData.append('originalPrice', newProduct.originalPrice);
    formData.append('discountedPrice', newProduct.discountedPrice || 0);
    formData.append('showDiscount', newProduct.showDiscount);
    formData.append('initialQuantity', newProduct.currentStock);
    formData.append('image', newProduct.imageFile);

    await axios.post('http://localhost:5000/api/products', formData, {
      headers: {
        Authorization: `Bearer ${user?.token || ''}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    alert('Product Added Successfully!');
    setNewProduct({
      category: 'Bedsheet',
      name: '',
      companyName: 'Niva Handlooms',
      oneLinerDescription: '',
      type: 'Fitted',
      price: '',
      originalPrice: '',
      discountedPrice: '',
      showDiscount: false,
      size: 'Double',
      fabricType: 'Cotton',
      currentStock: 10,
      imageFile: null,
      imagePreview: '',
      oneLinerDescription: '',
    });

    fetchData();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to add product');
  }
};

  // Update Stock Handler
  const handleUpdateStock = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        { currentStock: Number(tempStock) },
        getAuthConfig()
      );
      setEditingStockId(null);
      fetchData();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = window.confirm('Delete this product from inventory? This cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, getAuthConfig());

      if (editingProductId === productId) {
        closeEditProduct();
      }

      if (editingStockId === productId) {
        setEditingStockId(null);
        setTempStock(0);
      }

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Update Order Status Handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { orderStatus: newStatus },
        getAuthConfig()
      );
      fetchData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // Device se File pick karke Base64 string banane ka function
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert('File size too large! Please select an image under 2MB.');
    return;
  }

  setNewProduct((prev) => ({
    ...prev,
    imageFile: file,
    imagePreview: URL.createObjectURL(file),
  }));
};

  if (loading) {
    return (
      <div className="admin-container admin-loading">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="subtitle">Manage products, inventory stock & customer orders</p>
      </div>

      {apiError && (
        <div className="admin-error-banner">
          <AlertCircle size={18} /> {apiError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} /> Manage Products ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} /> Manage Orders ({orders.length})
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="admin-content-grid">
          
          {/* Form Card */}
          <div className="admin-card">
            <h3><PlusCircle size={20} className="icon-accent" /> Add New Product</h3>
            
            <form onSubmit={handleAddProduct} className="admin-form">
              <label className="field-label">Product Name</label>
              <div className="form-group-row">
                <input
                  type="text"
                  placeholder="Product Title (e.g. Royal Cotton Bedsheet)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Bedsheet">Category: Bedsheet</option>
                  <option value="Deewan Set">Category: Deewan Set</option>
                </select>
              </div>

              <label className="field-label">Brand and Description</label>
              <div className="form-group-row">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newProduct.companyName}
                  onChange={(e) => setNewProduct({ ...newProduct, companyName: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="One-line description"
                  value={newProduct.oneLinerDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, oneLinerDescription: e.target.value })}
                />
              </div>

              <label className="field-label">Product Style and Pricing</label>
              <div className="form-group-row">
                <select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                >
                  <option value="Fitted">Type: Fitted</option>
                  <option value="Flat">Type: Flat</option>
                  <option value="Reversible">Type: Reversible</option>
                  <option value="Single Sided">Type: Single Sided</option>
                </select>
                <input
                  type="number"
                  placeholder="Base Price (₹)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Discounted Price (₹)"
                  value={newProduct.discountedPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, discountedPrice: e.target.value })}
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProduct.showDiscount}
                    onChange={(e) => setNewProduct({ ...newProduct, showDiscount: e.target.checked })}
                  />
                  Show Discount
                </label>
              </div>

              <label className="field-label">Size, Fabric, and Stock</label>
              <div className="form-group-row">
                <select
                  value={newProduct.size}
                  onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="King">King</option>
                  <option value="Queen">Queen</option>
                </select>

                <select
                  value={newProduct.fabricType}
                  onChange={(e) => setNewProduct({ ...newProduct, fabricType: e.target.value })}
                >
                  <option value="Cotton">Cotton</option>
                  <option value="Glace Cotton">Glace Cotton</option>
                  <option value="Linen">Linen</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Blended">Blended</option>
                  <option value="Woolen">Woolen</option>
                </select>

                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: e.target.value })}
                  required
                />
              </div>

              <div className="file-upload-box">
                <label className="file-label">Upload Image from Device:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!newProduct.imageFile}
                />

                {newProduct.imagePreview && (
                  <div className="preview-container">
                    <img src={newProduct.imagePreview} alt="Preview" className="img-preview" />
                    <span className="preview-text">Preview Selected Image</span>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn">Add Product to Store</button>
            </form>
          </div>

          {/* Edit Product Card */}
          {editingProductId && editProduct && (
            <div className="admin-card">
              <h3>Edit Product Details</h3>
              <p className="sub-info" style={{ marginTop: '-6px', marginBottom: '14px' }}>
                Update the product information, stock, and discount visibility.
              </p>

              <form
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProduct();
                }}
              >
                <label className="field-label">Product Name</label>
                <div className="form-group-row">
                  <input
                    type="text"
                    placeholder="Product Title"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    required
                  />
                  <select
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  >
                    <option value="Bedsheet">Category: Bedsheet</option>
                    <option value="Deewan Set">Category: Deewan Set</option>
                  </select>
                </div>

                <label className="field-label">Brand and Description</label>
                <div className="form-group-row">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={editProduct.companyName}
                    onChange={(e) => setEditProduct({ ...editProduct, companyName: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="One-line description"
                    value={editProduct.oneLinerDescription}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, oneLinerDescription: e.target.value })
                    }
                  />
                </div>

                <label className="field-label">Product Style and Pricing</label>
                <div className="form-group-row">
                  <select
                    value={editProduct.type}
                    onChange={(e) => setEditProduct({ ...editProduct, type: e.target.value })}
                  >
                    <option value="Fitted">Type: Fitted</option>
                    <option value="Flat">Type: Flat</option>
                    <option value="Reversible">Type: Reversible</option>
                    <option value="Single Sided">Type: Single Sided</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Base Price (₹)"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Discounted Price (₹)"
                    value={editProduct.discountedPrice}
                    onChange={(e) => setEditProduct({ ...editProduct, discountedPrice: e.target.value })}
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editProduct.showDiscount}
                      onChange={(e) => setEditProduct({ ...editProduct, showDiscount: e.target.checked })}
                    />
                    Show Discount
                  </label>
                </div>

                <label className="field-label">Size, Fabric, and Stock</label>
                <div className="form-group-row">
                  <select
                    value={editProduct.size}
                    onChange={(e) => setEditProduct({ ...editProduct, size: e.target.value })}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="King">King</option>
                    <option value="Queen">Queen</option>
                  </select>

                  <select
                    value={editProduct.fabricType}
                    onChange={(e) => setEditProduct({ ...editProduct, fabricType: e.target.value })}
                  >
                    <option value="Cotton">Cotton</option>
                    <option value="Glace Cotton">Glace Cotton</option>
                    <option value="Linen">Linen</option>
                    <option value="Polyester">Polyester</option>
                    <option value="Blended">Blended</option>
                    <option value="Woolen">Woolen</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={editProduct.currentStock}
                    onChange={(e) => setEditProduct({ ...editProduct, currentStock: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-row">
                  <button type="submit" className="submit-btn">
                    Save Product Changes
                  </button>
                  <button type="button" className="btn-action edit" onClick={closeEditProduct}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Inventory Table Card */}
          <div className="admin-card">
            <h3>Inventory Stock List</h3>
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Size / Fabric</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="product-info-cell">
                        <img src={p.imageUrl} alt={p.name} />
                        <div>
                          <strong>{p.name}</strong>
                          <p className="sub-info">{p.companyName}</p>
                        </div>
                      </td>
                      <td>
                        {p.showDiscount ? `₹${p.discountedPrice} (₹${p.originalPrice})` : `₹${p.originalPrice}`}
                      </td>
                      <td>{p.size} / {p.fabricType}</td>
                      <td>
                        {editingStockId === p._id ? (
                          <input
                            type="number"
                            className="stock-edit-input"
                            value={tempStock}
                            onChange={(e) => setTempStock(e.target.value)}
                          />
                        ) : (
                          <span className={`stock-pill ${p.currentStock === 0 ? 'out' : ''}`}>
                            {p.currentStock} in stock
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                        {editingStockId === p._id ? (
                          <button
                            onClick={() => handleUpdateStock(p._id)}
                            className="btn-action save"
                            type="button"
                          >
                            <Save size={15} /> Save Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(p._id);
                              setTempStock(p.currentStock);
                            }}
                            className="btn-action edit"
                            type="button"
                          >
                            <Edit3 size={15} /> Edit Stock
                          </button>
                        )}

                        <button
                          onClick={() => openEditProduct(p)}
                          className="btn-action edit"
                          style={{ marginLeft: '8px' }}
                          type="button"
                        >
                          <Edit3 size={15} /> Edit Product
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="btn-action save"
                          style={{ marginLeft: '8px', background: '#b42318', padding: '8px 10px' }}
                          type="button"
                          aria-label="Delete product"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="admin-card">
          <h3>Customer Orders ({orders.length})</h3>
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Delivery</th>
                  <th>Status Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const statusVal = o.orderStatus || o.status || 'Requested';

                  return (
                    <tr key={o._id}>
                      <td><strong>#{o._id.slice(-6).toUpperCase()}</strong></td>
                      <td>
                        <strong>{o.user?.name || 'Customer'}</strong>
                        <p className="sub-info">{o.user?.email}</p>
                      </td>
                      <td><strong>₹{o.totalPrice}</strong></td>
                      <td>{o.deliveryMethod}</td>
                      <td>
                        <select
                          value={statusVal}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className={`status-select ${statusVal.toLowerCase()}`}
                        >
                          <option value="Requested">Requested</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;