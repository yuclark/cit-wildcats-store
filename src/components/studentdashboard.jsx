// src/components/StudentDashboard.jsx - UPDATED WITH REAL RESERVATIONS/ORDERS
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import StudentProfile from './studentprofile';
import BrowseProducts from './browseproducts';
import MyReservations from './myreservations';
import StudentDashboard from './studentdashboard.css';


const StudentDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  // ✅ NEW STATES FOR REAL DATA
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // ✅ FETCH REAL RESERVATIONS AND ORDERS
  const fetchOrdersAndReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // ✅ SEPARATE RESERVATIONS AND ORDERS
        const allReservations = data.filter(item => item.order_type === 'reservation');
        const allOrders = data.filter(item => item.order_type === 'order');
        
        setReservations(allReservations);
        setOrders(allOrders);
      } else {
        console.error('Failed to fetch orders:', response.status);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH DATA ON COMPONENT MOUNT
  useEffect(() => {
    fetchOrdersAndReservations();
  }, []);

  // ✅ REFRESH DATA WHEN COMING BACK TO DASHBOARD
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchOrdersAndReservations();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Show Browse Products when browse tab is active
  if (activeTab === 'browse') {
  return (
    <BrowseProducts 
      user={user} 
      onBack={() => setActiveTab('dashboard')}
      onNavigateToReservations={() => setActiveTab('reservations')} // ✅ ADD THIS
    />
  );
}
  //show diri ang myreservations
  if (activeTab === 'reservations') {
  return (
    <MyReservations 
      user={user} 
      onBack={() => setActiveTab('dashboard')} 
    />
  );
}

  // Show Profile component when showProfile is true
  if (showProfile) {
    return (
      <StudentProfile 
        user={user} 
        setUser={setUser} 
        onBack={() => setShowProfile(false)} 
      />
    );
  }

  return (
    <div className="buyer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🐱</span>
            <span className="logo-text">CIT Wildcats Store</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="main-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            🛒 Browse Products
          </button>
          <button 
            className={`nav-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            📅 My Reservations
          </button>
          <button 
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 My Orders
          </button>
        </nav>

        {/* Profile Section */}
        <div className="header-right">
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(true)}
          >
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="container">
          <h1 className="welcome-title">Welcome, {user?.name?.split(' ')[0] || 'Wildcat'}! 👋</h1>
          
          <div className="dashboard-grid">
            {/* Browse Products Card */}
            <div className="dashboard-card">
              <div className="card-icon">🛍️</div>
              <h2>Browse Products</h2>
              <p>Explore our wide selection of school supplies and items</p>
              <button 
                className="card-btn"
                onClick={() => setActiveTab('browse')}
              >
                View Products
              </button>
            </div>

            {/* My Reservations Card */}
            <div className="dashboard-card">
              <div className="card-icon">📋</div>
              <h2>My Reservations</h2>
              <p>Check your current and past reservations</p>
              <button 
                className="card-btn"
                onClick={() => setActiveTab('reservations')}
              >
                View Reservations
              </button>
            </div>
          </div>

          {/* ✅ REAL RECENT ACTIVITY */}
          <div className="activity-section">
            <div className="activity-left">
              <h3>
                Reservations 
                <span className="count">
                  {loading ? '...' : `${reservations.length} total`}
                </span>
              </h3>
              
              <div className="activity-list">
                {loading ? (
                  <div className="loading-item">
                    <span>🐱 Loading reservations...</span>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="empty-state">
                    <span>📋 No reservations yet</span>
                    <p>Reserve some items to see them here!</p>
                  </div>
                ) : (
                  reservations.slice(0, 3).map(reservation => (
                    <div key={reservation.id} className="activity-item">
                      <div className="item-details">
                        <span className="item-name">
                          {reservation.items?.[0]?.product_name || 'Product'}
                        </span>
                        <span className="item-order-number">
                          #{reservation.order_number}
                        </span>
                      </div>
                      <span className="item-date">
                        {new Date(reservation.created_at).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit', 
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`item-status ${reservation.status}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="view-all-btn"
                onClick={() => setActiveTab('reservations')}
              >
                View All Reservations
              </button>
            </div>

            <div className="activity-right">
              <h3>
                Orders 
                <span className="count">
                  {loading ? '...' : `${orders.length} total`}
                </span>
              </h3>
              
              <div className="activity-list">
                {loading ? (
                  <div className="loading-item">
                    <span>🐱 Loading orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <span>📦 No orders yet</span>
                    <p>Order some items to see them here!</p>
                  </div>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="activity-item">
                      <div className="item-details">
                        <span className="item-name">
                          {order.items?.[0]?.product_name || 'Product'}
                        </span>
                        <span className="item-order-number">
                          #{order.order_number}
                        </span>
                      </div>
                      <span className="item-date">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="item-amount">
                        ₱{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="view-all-btn"
                onClick={() => setActiveTab('orders')}
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
