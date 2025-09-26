// src/components/StudentProfile.jsx - BUYER PROFILE PAGE
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './StudentProfile.css';

const StudentProfile = ({ user, setUser, onBack }) => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    student_id: '',
    email: '',
    phone_number: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.name || '',
        student_id: user.student_id || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Update user data in custom users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          address: profileData.address
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update user object in app state
      const updatedUser = {
        ...user,
        name: profileData.full_name,
        phone_number: profileData.phone_number,
        address: profileData.address
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('❌ Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    setProfileData({
      full_name: user.name || '',
      student_id: user.student_id || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      address: user.address || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="student-profile">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div className="logo">
            <span className="logo-icon">🐱</span>
            <span className="logo-text">Browse Products</span>
            <span className="logo-text">My Reservations</span>
            <span className="logo-text">My Orders</span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-icon">🔍</div>
          <div className="user-icon">👤</div>
          <div className="profile-avatar">O</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="container">
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-title-row">
              <h1>My Profile</h1>
              {!isEditing ? (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <p className="profile-subtitle">Manage your personal details and account settings.</p>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {/* Profile Avatar */}
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <div className="avatar-circle">
                  <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="status-dot"></div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="profile-form">
              <div className="form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'readonly' : ''}
                  />
                </div>

                {/* Student ID */}
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={profileData.student_id}
                    disabled={true}
                    className="readonly"
                  />
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'readonly' : ''}
                  />
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled={true}
                    className="readonly"
                  />
                </div>

                {/* Address - Full Width */}
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'readonly' : ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
