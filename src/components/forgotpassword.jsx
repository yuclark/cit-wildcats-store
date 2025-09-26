// src/components/forgotpassword.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './auth.css';

const ForgotPassword = ({ isPasswordReset, onPasswordResetComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // ✅ AUTO-ADVANCE TO STEP 3 WHEN PASSWORD RECOVERY IS DETECTED
  useEffect(() => {
    if (isPasswordReset) {
      console.log('Password reset mode detected - jumping to step 3');
      setStep(3);
      setMessage('✅ OTP verified! Now set your new password.');
    }
  }, [isPasswordReset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
        } else if (!value.endsWith('@cit.edu')) {
          newErrors.email = 'Please use your CIT institutional email (@cit.edu)';
        } else {
          delete newErrors.email;
        }
        break;

      case 'otp':
        if (!value) {
          newErrors.otp = 'OTP code is required';
        } else if (value.length !== 6) {
          newErrors.otp = 'OTP must be 6 digits';
        } else {
          delete newErrors.otp;
        }
        break;

      case 'newPassword':
        if (!value) {
          newErrors.newPassword = 'Password is required';
        } else if (value.length < 6) {
          newErrors.newPassword = 'Password must be at least 6 characters';
        } else {
          delete newErrors.newPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== value) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!formData.email.endsWith('@cit.edu')) {
      setErrors({ email: 'Please use your CIT institutional email (@cit.edu)' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        {
          redirectTo: `${window.location.origin}/forgot-password`
        }
      );

      if (error) {
        console.error('Reset password error:', error);
        setMessage('✅ If your email is registered, you will receive an OTP code shortly.');
      } else {
        setMessage('✅ OTP code sent to your email! Check your inbox and spam folder.');
      }
      
      setStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      setMessage('✅ If your email is registered, you will receive an OTP code shortly.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email.trim(),
        token: formData.otp.trim(),
        type: 'recovery'
      });

      if (error) {
        if (error.message.includes('invalid') || error.message.includes('expired')) {
          throw new Error('Invalid or expired code. Please request a new one.');
        }
        throw error;
      }

      // ✅ DON'T ADVANCE TO STEP 3 HERE - LET THE AUTH STATE CHANGE HANDLE IT
      setMessage('✅ OTP verified! Preparing password reset...');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update password - ✅ UPDATED TO USE CALLBACK
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setMessage('✅ Password reset successful! Redirecting to your dashboard...');

      // ✅ GET USER DATA AND COMPLETE PASSWORD RESET
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email,
        type: data.user.user_metadata?.user_type || 'student'
      };

      // ✅ USE CALLBACK TO COMPLETE RESET AND SET USER
      setTimeout(() => {
        onPasswordResetComplete(user);
        
        // Redirect based on user type
        if (user.type === 'student') {
          navigate('/student-dashboard');
        } else if (user.type === 'staff') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('❌ Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        {
          redirectTo: `${window.location.origin}/forgot-password`
        }
      );

      setMessage('✅ New OTP sent to your email if the account exists!');
    } catch (error) {
      setMessage('✅ New OTP sent to your email if the account exists!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left Side - Form */}
      <div className="auth-left">
        <div className="auth-form-container">
          <h2 className="auth-title">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Set New Password'}
          </h2>
          
          <p className="auth-subtitle">
            {step === 1 && 'Enter your CIT email to receive OTP'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create your new secure password'}
          </p>

          {message && (
            <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label>CIT Institutional Email</label>
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

              <button type="submit" className="auth-button cit-button" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP Code'}
              </button>
              
              <div style={{ 
                background: 'rgba(255, 215, 0, 0.1)', 
                padding: '12px', 
                borderRadius: '6px', 
                marginTop: '15px',
                fontSize: '14px',
                color: '#666'
              }}>
                <p><strong>🔒 Security Note:</strong></p>
                <p>For security reasons, we don't reveal whether an email exists in our system. If your email is registered, you'll receive an OTP code.</p>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label>Enter OTP Code</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.otp ? 'error' : ''}
                  maxLength={6}
                />
                {errors.otp && <span className="field-error">{errors.otp}</span>}
              </div>

              <button type="submit" className="auth-button cit-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  className="auth-link" 
                  onClick={resendOTP}
                  disabled={loading}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-button cit-button" disabled={loading}>
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
              
              <div style={{ 
                background: 'rgba(255, 215, 0, 0.1)', 
                padding: '12px', 
                borderRadius: '6px', 
                marginTop: '15px',
                fontSize: '14px',
                color: '#666'
              }}>
                <p><strong>🔐 Final Step:</strong></p>
                <p>Once you set your new password, you'll be automatically signed in and redirected to your dashboard.</p>
              </div>
            </form>
          )}

          <div className="form-links">
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
            {step === 1 && (
              <Link to="/signup" className="auth-link">
                Don't have an account? Register
              </Link>
            )}
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
              <div className="wildcat-emblem">🔐</div>
            </div>
          </div>
          <div className="tagline">
            <p>Secure Access</p>
            <p>Password Recovery</p>
            <p>Stay Protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
