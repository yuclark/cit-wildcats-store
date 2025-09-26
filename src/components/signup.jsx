// src/components/SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './auth.css';

const SignUp = ({ setUser }) => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'staff'
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    staffId: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateSingleField(name, value.trim());
  };

  const validateSingleField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'fullName':
        if (!value) {
          newErrors.fullName = 'Full name is required';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'studentId':
        if (activeTab === 'student' && !value) {
          newErrors.studentId = 'Student ID is required';
        } else {
          delete newErrors.studentId;
        }
        break;

      case 'staffId':
        if (activeTab === 'staff' && !value) {
          newErrors.staffId = 'Staff ID is required';
        } else {
          delete newErrors.staffId;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid institutional email address';
        } else if (!value.endsWith('@cit.edu')) {
          newErrors.email = 'Please use your CIT institutional email (@cit.edu)';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phoneNumber':
        if (!value) {
          newErrors.phoneNumber = 'Phone number is required';
        } else {
          delete newErrors.phoneNumber;
        }
        break;

      case 'address':
        if (!value) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== value) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (activeTab === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (activeTab === 'staff' && !formData.staffId.trim()) {
      newErrors.staffId = 'Staff ID is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid institutional email address';
    } else if (!formData.email.endsWith('@cit.edu')) {
      newErrors.email = 'Please use your CIT institutional email (@cit.edu)';
    }

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Check if account already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, student_id, staff_id')
        .or(`email.eq.${formData.email},student_id.eq.${formData.studentId || 'null'},staff_id.eq.${formData.staffId || 'null'}`);

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser && existingUser.length > 0) {
        setMessage('❌ Account already exists. Please log in instead.');
        setLoading(false);
        return;
      }

      // Create account with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
        options: {
          data: {
            full_name: formData.fullName.trim(),
            user_type: activeTab,
            student_id: activeTab === 'student' ? formData.studentId.trim() : null,
            staff_id: activeTab === 'staff' ? formData.staffId.trim() : null,
            phone_number: formData.phoneNumber.trim(),
            address: formData.address.trim()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Account already exists. Please log in instead.');
        }
        throw signUpError;
      }

      if (data.user) {
        // Insert additional user info
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: formData.email.trim(),
              full_name: formData.fullName.trim(),
              user_type: activeTab,
              student_id: activeTab === 'student' ? formData.studentId.trim() : null,
              staff_id: activeTab === 'staff' ? formData.staffId.trim() : null,
              phone_number: formData.phoneNumber.trim(),
              address: formData.address.trim()
            }
          ]);

        if (insertError) console.log('Additional data insert error:', insertError);

        // Show success message and redirect based on role
        const userRole = activeTab === 'student' ? 'Student' : 'Admin';
        setMessage(`✅ Registration Successful! Welcome to CIT Wildcats ${userRole} portal.`);
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          if (activeTab === 'student') {
            navigate('/student-dashboard');
          } else {
            navigate('/admin-dashboard');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left Side - CIT Wildcats Branding */}
      <div className="auth-right cit-branding">
        <div className="branding-content">
          <div className="logo-area">
            <div className="cit-logo">
              <h1>CIT</h1>
              <h2>WILDCATS</h2>
              <div className="wildcat-emblem">🐱</div>
            </div>
          </div>
          <div className="tagline">
            <p>Join the Pride</p>
            <p>Shop Smart</p>
            <p>Go Wildcats!</p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="auth-left">
        <div className="auth-form-container">
          <h2 className="auth-title">Use CIT Shop Now!</h2>
          
          {/* Student/Staff Tabs */}
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => {setActiveTab('student'); setErrors({});}}
            >
              Student
            </button>
            <button 
              className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => {setActiveTab('staff'); setErrors({});}}
            >
              Admin
            </button>
          </div>

          {message && (
            <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Juan Dela Cruz"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            {/* Student ID or Staff ID */}
            {activeTab === 'student' ? (
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="12-1234-123"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.studentId ? 'error' : ''}
                />
                {errors.studentId && <span className="field-error">{errors.studentId}</span>}
              </div>
            ) : (
              <div className="form-group">
                <label>Staff ID *</label>
                <input
                  type="text"
                  name="staffId"
                  placeholder="1234"
                  value={formData.staffId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.staffId ? 'error' : ''}
                />
                {errors.staffId && <span className="field-error">{errors.staffId}</span>}
              </div>
            )}

            {/* Institutional Email */}
            <div className="form-group">
              <label>CIT Institutional Email *</label>
              <input
                type="email"
                name="email"
                placeholder="juan.delacruz@cit.edu"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+63 912 345 6789"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
            </div>

            {/* Address */}
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="Cebu City, Philippines"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-button cit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="form-links">
            <Link to="/login" className="auth-link">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;