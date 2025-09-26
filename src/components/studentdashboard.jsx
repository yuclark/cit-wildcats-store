// src/components/StudentDashboard.jsx - ADD PROFILE FUNCTIONALITY
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import StudentProfile from './studentprofile'; // ← ADD THIS IMPORT
import './studentdashboard.css';

const StudentDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false); // ← ADD THIS STATE

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ ADD THIS: Show Profile component when showProfile is true
  if (showProfile) {
    return (
      <StudentProfile 
        user={user} 
        setUser={setUser} 
        onBack={() => setShowProfile(false)} 
      />
    );
  }

  const mockReservations = [
    { id: 1, item: 'Yellow Pad', date: '25/05/2025', status: 'confirmed' },
    { id: 2, item: 'Yellow Pad', date: '25/05/2025', status: 'pending' },
    { id: 3, item: 'Yellow Pad', date: '25/05/2025', status: 'pending' }
  ];

  const mockOrders = [
    { id: 1, item: 'Yellow Pad', date: '25/05/2025', quantity: 'Qty: 1' },
    { id: 2, item: 'Yellow Pad', date: '25/05/2025', quantity: 'Qty: 1' }
  ];

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

        {/* Profile Section - ✅ UPDATE THIS PART */}
        <div className="header-right">
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(true)} // ← ADD THIS CLICK HANDLER
          >
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Rest of your existing dashboard content... */}
      <main className="dashboard-main">
        <div className="container">
          <h1 className="welcome-title">Welcome, {user?.name?.split(' ')[0] || 'Wildcat'}! 👋</h1>
          

          <div className="dashboard-grid">
            {/* Browse Products Card */}
            <div className="dashboard-card">
              <div className="card-icon">🛍️</div>
              <h2>Browse Products</h2>
              <p>Explore our wide selection of school supplies and items</p>
              <button className="card-btn">View Products</button>
            </div>

            {/* My Reservations Card */}
            <div className="dashboard-card">
              <div className="card-icon">📋</div>
              <h2>My Reservations</h2>
              <p>Check your current and past reservations</p>
              <button className="card-btn">View Reservations</button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-left">
              <h3>Reservations <span className="count">{mockReservations.length} upcoming</span></h3>
              <div className="activity-list">
                {mockReservations.map(item => (
                  <div key={item.id} className="activity-item">
                    <span className="item-name">{item.item}</span>
                    <span className="item-date">{item.date}</span>
                    <span className={`item-status ${item.status}`}>
                      {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="view-all-btn">View All Reservations</button>
            </div>

            <div className="activity-right">
              <h3>Orders <span className="count">{mockOrders.length} in progress</span></h3>
              <div className="activity-list">
                {mockOrders.map(item => (
                  <div key={item.id} className="activity-item">
                    <span className="item-name">{item.item}</span>
                    <span className="item-date">{item.date}</span>
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                ))}
              </div>
              <button className="view-all-btn">View All Orders</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
