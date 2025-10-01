// src/components/StudentProfile.jsx - FIXED WITH CORRECT SUPABASE FIELDS
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './studentprofile.css';

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

  // ✅ FETCH FRESH USER DATA WITH CORRECT FIELD NAMES
  const fetchUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, student_id, full_name, phone_number, address, user_type, staff_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      console.log('✅ Fresh user data from Supabase:', data);

      // ✅ MAP TO EXACT SUPABASE FIELD NAMES
      setProfileData({
        full_name: data.full_name || '',
        student_id: data.student_id || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        address: data.address || ''
      });

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // ✅ FALLBACK TO USER OBJECT IF SUPABASE FAILS
      setProfileData({
        full_name: user.full_name || user.name || '',
        student_id: user.student_id || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
  };

  useEffect(() => {
    fetchUserProfile();
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
      // ✅ UPDATE WITH EXACT SUPABASE FIELD NAMES
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          address: profileData.address
          // Note: email and student_id are read-only
        })
        .eq('id', user.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Updated user data:', data);

      // ✅ UPDATE USER OBJECT IN STATE
      const updatedUser = {
        ...user,
        full_name: profileData.full_name,
        name: profileData.full_name, // Keep both for compatibility
        phone_number: profileData.phone_number,
        address: profileData.address
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessage('❌ Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // ✅ RESET TO FRESH DATA FROM SUPABASE
    fetchUserProfile();
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
            <span className="logo-text">CIT Wildcats Profile</span>
          </div>
        </div>

        <div className="header-right">
          <span className="user-welcome">Welcome, {profileData.full_name?.split(' ')[0] || 'Wildcat'}! 🐱</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="container">
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
                  <span className="avatar-text">
                    {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : '🐱'}
                  </span>
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
                    placeholder={!profileData.full_name ? "Full name not set" : ""}
                  />
                </div>

                {/* Student ID - Read Only */}
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={profileData.student_id || 'Not set'}
                    disabled={true}
                    className="readonly"
                    title="Student ID cannot be changed"
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
                    placeholder={!profileData.phone_number ? "Phone number not set" : ""}
                  />
                </div>

                {/* Email Address - Read Only */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email || 'Not set'}
                    disabled={true}
                    className="readonly"
                    title="Email cannot be changed"
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
                    placeholder={!profileData.address ? "Address not set" : ""}
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
