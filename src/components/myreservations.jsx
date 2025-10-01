// src/components/MyReservations.jsx
import React, { useState, useEffect } from 'react';
import './myreservations.css';

const MyReservations = ({ user, onBack }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Fetch reservations from API
  const fetchReservations = async () => {
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
        // Filter only reservations
        const reservationsOnly = data.filter(item => item.order_type === 'reservation');
        setReservations(reservationsOnly);
      } else {
        setMessage('❌ Failed to load reservations.');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setMessage('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel reservation
  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${reservationId}/cancel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Reservation cancelled successfully!');
        fetchReservations(); // Refresh the list
      } else {
        setMessage(`❌ ${data.error || 'Failed to cancel reservation'}`);
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setMessage('❌ Network error. Please try again.');
    }
    
    setShowCancelModal(false);
    setReservationToCancel(null);
  };

  // Filter and sort reservations
  const getFilteredReservations = () => {
    let filtered = [...reservations];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
    }

    // Sort reservations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'amount-high':
          return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case 'amount-low':
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'released': return 'status-released';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelReservation = (status) => {
    return status === 'pending' || status === 'approved';
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) {
    return (
      <div className="my-reservations">
        <div className="loading-container">
          <div className="loading-spinner">🐱</div>
          <p>Loading your reservations...</p>
        </div>
      </div>
    );
  }

  const filteredReservations = getFilteredReservations();

  return (
    <div className="my-reservations">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="cancel-modal">
            <div className="modal-header">
              <h3>Cancel Reservation</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this reservation?</p>
              <div className="reservation-details">
                <strong>{reservationToCancel?.items?.[0]?.product_name}</strong>
                <br />
                Order #{reservationToCancel?.order_number}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCancelModal(false)}
              >
                Keep Reservation
              </button>
              <button 
                className="btn-danger" 
                onClick={() => handleCancelReservation(reservationToCancel.id)}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="reservations-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <div className="page-title">
            <h1>📅 My Reservations</h1>
            <p>Manage your CIT Wildcats store reservations</p>
          </div>
        </div>
        <div className="header-right">
          <span className="user-welcome">Welcome, {user?.name?.split(' ')[0]}! 🐱</span>
        </div>
      </header>

      <main className="reservations-main">
        <div className="container">
          {/* Message Display */}
          {message && (
            <div className={`message-banner ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
              <button className="close-message" onClick={() => setMessage('')}>×</button>
            </div>
          )}

          {/* Filters and Stats */}
          <div className="reservations-controls">
            <div className="stats-section">
              <div className="stat-card">
                <span className="stat-number">{reservations.length}</span>
                <span className="stat-label">Total Reservations</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {reservations.filter(r => r.status === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {reservations.filter(r => r.status === 'approved').length}
                </span>
                <span className="stat-label">Approved</span>
              </div>
            </div>

            <div className="filters-section">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="released">Released</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">Amount (High to Low)</option>
                  <option value="amount-low">Amount (Low to High)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No reservations found</h3>
              <p>
                {selectedStatus === 'all' 
                  ? "You haven't made any reservations yet. Browse products to get started!"
                  : `No reservations with status "${selectedStatus}" found.`
                }
              </p>
              <button className="btn-primary" onClick={onBack}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="reservations-grid">
              {filteredReservations.map(reservation => (
                <div key={reservation.id} className="reservation-card">
                  <div className="card-header">
                    <div className="order-info">
                      <span className="order-number">#{reservation.order_number}</span>
                      <span className={`status-badge ${getStatusColor(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                    <div className="reservation-date">
                      {formatDate(reservation.created_at)}
                    </div>
                  </div>

                  <div className="card-body">
                    {reservation.items && reservation.items.map(item => (
                      <div key={item.id} className="reservation-item">
                        <div className="item-details">
                          <h4 className="item-name">{item.product_name}</h4>
                          <div className="item-meta">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">₱{parseFloat(item.unit_price).toFixed(2)} each</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {reservation.notes && (
                      <div className="reservation-notes">
                        <strong>Notes:</strong> {reservation.notes}
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="total-amount">
                      <strong>Total: ₱{parseFloat(reservation.total_amount).toFixed(2)}</strong>
                    </div>
                    <div className="card-actions">
                      {canCancelReservation(reservation.status) && (
                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setReservationToCancel(reservation);
                            setShowCancelModal(true);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        className="btn-details"
                        onClick={() => alert(`View details for ${reservation.order_number} (to be implemented)`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyReservations;
