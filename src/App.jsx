// src/App.jsx - MODIFIED VERSION
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Login from './components/login';
import SignUp from './components/signup';
import ForgotPassword from './components/forgotpassword';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false); // ← ADD THIS FLAG

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
        
        // ✅ HANDLE PASSWORD RECOVERY EVENT
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
          
          // ✅ ONLY SET USER IF NOT IN PASSWORD RESET FLOW
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

  // Student Dashboard Component (INLINE)
  const StudentDashboard = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #800000 0%, #5a0722 100%)'
    }}>
      <h1 style={{color: '#FFD700'}}>🐱 Student Wildcat Dashboard</h1>
      <h2 style={{color: 'white'}}>Hello, {user?.name}!</h2>
      <p style={{color: '#FFD700'}}>Student ID: <strong>{user?.student_id || 'N/A'}</strong></p>
      <p style={{color: 'white'}}>Welcome to your student portal!</p>
      
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        style={{
          padding: '12px 24px',
          background: '#FFD700',
          color: '#800000',
          border: '2px solid #800000',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px',
          fontWeight: 'bold'
        }}
      >
        Logout
      </button>
    </div>
  );

  // Admin Dashboard Component (INLINE)
  const AdminDashboard = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)'
    }}>
      <h1 style={{color: '#800000'}}>👑 Admin Wildcat Dashboard</h1>
      <h2 style={{color: '#5a0722'}}>Hello, {user?.name}!</h2>
      <p style={{color: '#800000'}}>Staff ID: <strong>{user?.staff_id || 'N/A'}</strong></p>
      <p style={{color: '#5a0722'}}>Welcome to your admin control panel!</p>
      
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        style={{
          padding: '12px 24px',
          background: '#800000',
          color: '#FFD700',
          border: '2px solid #FFD700',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px',
          fontWeight: 'bold'
        }}
      >
        Logout
      </button>
    </div>
  );

  // Generic Dashboard (INLINE)
  const Dashboard = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <h1>Welcome to CIT Wildcats Store!</h1>
      <h2>Hello, {user?.name}! 👋</h2>
      <p>Account type: <strong>{user?.type}</strong></p>
      <p>Email: <strong>{user?.email}</strong></p>
      <p>This is your reservation portal.</p>
      
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        style={{
          padding: '12px 24px',
          background: '#800000',
          color: '#FFD700',
          border: '2px solid #FFD700',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        Logout
      </button>
    </div>
  );

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
          
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <SignUp setUser={setUser} />} 
          /> 
          <Route 
            path="/forgot-password" 
            element={
              user && !isPasswordReset 
                ? <Navigate to="/dashboard" /> 
                : <ForgotPassword 
                    isPasswordReset={isPasswordReset} 
                    onPasswordResetComplete={handlePasswordResetComplete}
                  />
            }  
          />
          <Route 
            path="/student-dashboard" 
            element={user ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={user ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
