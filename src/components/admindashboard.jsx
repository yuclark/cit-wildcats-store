// src/components/AdminDashboard.jsx - PROFESSIONAL ADMIN DASHBOARD
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './admindashboard.css';

const AdminDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('admin-dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const stats = {
    totalProducts: 250,
    totalBuyers: 120,
    totalReservations: 85,
    totalOrders: 150
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🐱</span>
            <span className="logo-text">CIT Wildcats Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin-dashboard')}
          >
            🏠 Admin Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manage-products' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-products')}
          >
            📦 Manage Products
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manage-reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-reservations')}
          >
            📅 Manage Reservations
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manage-orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-orders')}
          >
            🛍️ Manage Orders
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manage-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-reports')}
          >
            📊 Manage Reports
          </button>
          <button 
            className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 Reports
          </button>
        </nav>

        {/* Profile Section */}
        <div className="header-right">
          <span className="admin-name">A</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome Back, Admin! 👑</h1>
            <p className="welcome-subtitle">
              Manage your Reserve & Order platform with ease. Keep an eye on key metrics and dive into specific management tasks.
            </p>
          </div>

          {/* Overview Section */}
          <div className="overview-section">
            <h2 className="section-title">Overview</h2>
            
            <div className="stats-grid">
              {/* Total Products */}
              <div className="stat-card">
                <div className="stat-icon products">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 17L12 21L20 17" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Products</h3>
                  <div className="stat-number">{stats.totalProducts}</div>
                </div>
              </div>

              {/* Total Buyers */}
              <div className="stat-card">
                <div className="stat-icon buyers">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2033 16.7007C21.6912 16.0473 20.9877 15.5922 20.2 15.4172" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25393 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75607 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Buyers</h3>
                  <div className="stat-number">{stats.totalBuyers}</div>
                </div>
              </div>

              {/* Total Reservations */}
              <div className="stat-card">
                <div className="stat-icon reservations">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Reservations</h3>
                  <div className="stat-number">{stats.totalReservations}</div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="stat-card">
                <div className="stat-icon orders">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Orders</h3>
                  <div className="stat-number">{stats.totalOrders}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn products-btn">
                <span className="action-icon">📦</span>
                <span>Add New Product</span>
              </button>
              <button className="action-btn orders-btn">
                <span className="action-icon">📋</span>
                <span>View New Orders</span>
              </button>
              <button className="action-btn reports-btn">
                <span className="action-icon">📊</span>
                <span>Generate Report</span>
              </button>
              <button className="action-btn users-btn">
                <span className="action-icon">👥</span>
                <span>Manage Users</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
