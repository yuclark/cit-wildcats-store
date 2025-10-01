// src/components/BrowseProducts.jsx - COMPLETE WITH HORIZONTAL FILTERS
import React, { useState, useEffect } from 'react';
import './browseproducts.css';

const BrowseProducts = ({ user, onBack, onNavigateToReservations }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    productName: '',
    orderNumber: '',
    amount: 0
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error('Failed to fetch products:', response.status);
        setMessage('❌ Failed to load products. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(['all', ...data.map(cat => cat.name)]);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleReservation = async (product) => {
    if (!product.is_in_stock) {
      setMessage('❌ This item is out of stock!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/create-reservation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          notes: `Reservation for ${product.name}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({
          productName: product.name,
          orderNumber: data.order_number,
          amount: parseFloat(product.price)
        });
        setShowSuccessModal(true);
        fetchProducts();
      } else {
        setMessage(`❌ ${data.error || 'Failed to create reservation'}`);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessData({
      productName: '',
      orderNumber: '',
      amount: 0
    });
  };

  const goToReservations = () => {
    closeSuccessModal();
    if (onNavigateToReservations) {
      onNavigateToReservations();
    } else {
      onBack();
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, priceRange, stockFilter, products]);

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_name === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        switch (priceRange) {
          case 'under-50':
            return price < 50;
          case '50-200':
            return price >= 50 && price <= 200;
          case '200-500':
            return price > 200 && price <= 500;
          case 'over-500':
            return price > 500;
          default:
            return true;
        }
      });
    }

    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(product => product.is_in_stock);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(product => !product.is_in_stock);
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="browse-products">
        <div className="loading-container">
          <div className="loading-spinner">🐱</div>
          <p>Loading CIT Wildcats products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-products">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <div className="success-icon">🎉</div>
              <h2>Reservation Confirmed!</h2>
              <button className="modal-close" onClick={closeSuccessModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="success-details">
                <div className="success-item">
                  <span className="label">Product:</span>
                  <span className="value">{successData.productName}</span>
                </div>
                
                <div className="success-item">
                  <span className="label">Reservation Number:</span>
                  <span className="value order-number">{successData.orderNumber}</span>
                </div>
                
                <div className="success-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">₱{successData.amount.toFixed(2)}</span>
                </div>
                
                <div className="success-item">
                  <span className="label">Status:</span>
                  <span className="value status">Pending Approval</span>
                </div>
              </div>
              
              <div className="success-message">
                <p>
                  🐱 <strong>Great choice, Wildcat!</strong> Your reservation has been submitted successfully.
                  Please wait for admin approval before pickup.
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeSuccessModal}>
                Continue Shopping
              </button>
              <button className="btn-primary" onClick={goToReservations}>
                View My Reservations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="browse-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div className="page-title">
            <h1>🛒 Browse Products</h1>
            <p>Reserve amazing CIT Wildcats merchandise and school supplies</p>
          </div>
        </div>
        <div className="header-right">
          <span className="user-welcome">Welcome, {user?.name?.split(' ')[0]}! 🐱</span>
        </div>
      </header>

      <main className="browse-main">
        <div className="container">
          {message && (
            <div className={`message-banner ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
              <button className="close-message" onClick={() => setMessage('')}>×</button>
            </div>
          )}

          {/* ✅ HORIZONTAL FILTERS SECTION */}
          <div className="filters-section">
            <div className="filters-horizontal">
              {/* Search */}
              <div className="search-container">
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              {/* Filters */}
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Price Range:</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-50">Under ₱50</option>
                    <option value="50-200">₱50 - ₱200</option>
                    <option value="200-500">₱200 - ₱500</option>
                    <option value="over-500">Over ₱500</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Stock:</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Items</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="results-info">
            <p>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <div className="placeholder-image">📦</div>
                    {!product.is_in_stock && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-details">
                      <div className="product-price">₱{parseFloat(product.price).toFixed(2)}</div>
                      <div className="product-category">{product.category_name}</div>
                    </div>
                    
                    <div className="stock-info">
                      <span className={`stock-badge ${product.is_in_stock ? 'in-stock' : 'out-of-stock'}`}>
                        {product.is_in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    
                    <div className="product-actions">
                      <button
                        className="action-btn reserve-btn full-width-btn"
                        onClick={() => handleReservation(product)}
                        disabled={!product.is_in_stock || loading}
                      >
                        📅 Reserve Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrowseProducts;
