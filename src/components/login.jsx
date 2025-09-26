// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    // Clear error when user starts typing
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
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid institutional email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid institutional email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (signInError) {
        // Generic error message for security
        setMessage('❌ Invalid login credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Get user role from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const user = {
          id: data.user.id,
          email: data.user.email,
          name: userData?.full_name || data.user.user_metadata?.full_name || data.user.email,
          type: userData?.user_type || data.user.user_metadata?.user_type || 'student',
          student_id: userData?.student_id,
          staff_id: userData?.staff_id
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        // Show success message and redirect based on role
        if (user.type === 'student') {
          setMessage('✅ Login Successful! Welcome back, Wildcat!');
          setTimeout(() => navigate('/student-dashboard'), 1500);
        } else {
          setMessage('✅ Login Successful! Welcome to Admin Dashboard!');
          setTimeout(() => navigate('/admin-dashboard'), 1500);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left Side - Login Form */}
      <div className="auth-left">
        <div className="auth-form-container">
          <h2 className="auth-title">WildShoppers Portal</h2>
          <p className="auth-subtitle">Welcome back, Wildcat! 🐱</p>

          {message && (
            <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Institutional Email</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@cit.edu"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-button cit-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div className="form-links">
            <Link to="/signup" className="auth-link">
              New to CIT? Register here
            </Link>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - CIT Wildcats Branding */}
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
            <p>Excellence in Education</p>
            <p>Innovation in Technology</p>
            <p>Pride of Cebu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
