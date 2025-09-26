// src/App.jsx - FINAL CLEAN VERSION
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Login from './components/login';
import SignUp from './components/signup';
import ForgotPassword from './components/forgotpassword';
import StudentDashboard from './components/studentdashboard';
import AdminDashboard from './components/admindashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          type: session.user.user_metadata?.user_type || 'student'
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event); // Debug log
        
        // Handle password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery detected - setting flag');
          setIsPasswordReset(true); // Set flag to prevent dashboard redirect
          return; // Don't set user yet
        }
        
        if (session) {
          const user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            type: session.user.user_metadata?.user_type || 'student'
          };
          
          // Only set user if not in password reset flow
          if (!isPasswordReset) {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
          setIsPasswordReset(false); // Reset flag on logout
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isPasswordReset]);

  // Password Reset Complete Handler
  const handlePasswordResetComplete = (updatedUser) => {
    setIsPasswordReset(false); // Clear the flag
    setUser(updatedUser); // Now set the user
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Route - Fixed to redirect to role-based dashboards */}
          <Route 
            path="/login" 
            element={user ? (
              <Navigate to={user.type === 'student' ? '/student-dashboard' : '/admin-dashboard'} />
            ) : <Login setUser={setUser} />} 
          />
          
          {/* Signup Route - Fixed to redirect to role-based dashboards */}
          <Route 
            path="/signup" 
            element={user ? (
              <Navigate to={user.type === 'student' ? '/student-dashboard' : '/admin-dashboard'} />
            ) : <SignUp setUser={setUser} />} 
          />
          
          {/* Forgot Password Route */}
          <Route 
            path="/forgot-password" 
            element={
              user && !isPasswordReset 
                ? <Navigate to={user.type === 'student' ? '/student-dashboard' : '/admin-dashboard'} />
                : <ForgotPassword 
                    isPasswordReset={isPasswordReset} 
                    onPasswordResetComplete={handlePasswordResetComplete}
                  />
            }  
          />
          
          {/* Student Dashboard Route */}
          <Route 
            path="/student-dashboard" 
            element={user ? <StudentDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          
          {/* Admin Dashboard Route */}
          <Route 
            path="/admin-dashboard" 
            element={user ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          
          {/* Default Route - Fixed to redirect to role-based dashboards */}
          <Route 
            path="/" 
            element={
              <Navigate to={user ? (
                user.type === 'student' ? '/student-dashboard' : '/admin-dashboard'
              ) : '/login'} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
