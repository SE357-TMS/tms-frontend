import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './TripDetailPage.css';
import viewIcon from '../../assets/icons/view.svg';
import addNewIcon from '../../assets/icons/addnew.svg';
import searchIcon from '../../assets/icons/searchicon.svg';
import EditTripModal from './EditTripModal';
import EditPassengerModal from '../BookingDetailPage/EditPassengerModal';
import tripService from '../../services/tripService';
import api from '../../lib/httpHandler';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  
  // Bookings/Travelers state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalTraveler, setModalTraveler] = useState(null);
  const [modalBookingId, setModalBookingId] = useState(null);
  const [modalTravelerIndex, setModalTravelerIndex] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await tripService.getTripById(id);
        const tripData = response.data?.data;
        setTrip(tripData);
        setError(null);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Unable to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  // Fetch bookings for this trip
  const fetchBookings = async () => {
    if (!id) return;
    
    setLoadingBookings(true);
    try {
      const response = await api.get('/api/v1/tour-bookings', {
        params: { tripId: id, pageSize: 100 }
      });
      const bookingsData = response.data?.data?.items || response.data?.data?.content || [];
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [id]);

  // Fetch trip data
  const fetchTrip = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/api/v1/trips/${id}`);
      setTrip(response.data.data);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError('Failed to load trip details');
    }
  };

  // Delete traveler handler
  const handleDeleteTraveler = async (bookingId, travelerId, travelerName) => {
    const result = await Swal.fire({
      title: 'Remove Traveler?',
      html: `Are you sure you want to remove <strong>${travelerName}</strong> from this booking?<br><small>Note: Cannot remove within 3 days of departure if booking is paid.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/v1/tour-bookings/${bookingId}/travelers/${travelerId}`);
        
        // Refresh both trip and bookings data
        await Promise.all([fetchTrip(), fetchBookings()]);
        
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Traveler has been removed successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error removing traveler:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to remove traveler'
        });
      }
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // HH:mm format
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'scheduled';
      case 'ONGOING':
        return 'ongoing';
      case 'FINISHED':
        return 'finished';
      case 'CANCELED':
        return 'canceled';
      default:
        return 'scheduled'; // fallback
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'ONGOING':
        return 'Ongoing';
      case 'FINISHED':
        return 'Finished';
      case 'CANCELED':
        return 'Canceled';
      default:
        return status || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="trip-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Loading trip details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-detail-page">
        <div className="error-state">
          {error}
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="trip-detail-page">
      <div className="trip-header">
        <h1>Trip Information</h1>
        <p className="trip-sub">Detailed information about the trip</p>
      </div>

      <div className="trip-info-card">
        <div className="trip-title">{trip.routeName || 'Trip Details'}</div>
        <div className="trip-subtitle">{trip.startLocation && trip.endLocation ? `${trip.startLocation} → ${trip.endLocation}` : ''}</div>

        <div className="trip-metrics">
          <div className="metric">
            <div className="label">Departure date</div>
            <div className="value">{formatDate(trip.departureDate)}</div>
          </div>
          <div className="metric">
            <div className="label">Return date</div>
            <div className="value">{formatDate(trip.returnDate)}</div>
          </div>
          <div className="metric">
            <div className="label">Pick-up time</div>
            <div className="value">{formatTime(trip.pickUpTime)}</div>
          </div>
          <div className="metric">
            <div className="label">Pick-up location</div>
            <div className="value">{trip.pickUpLocation || 'N/A'}</div>
          </div>
          <div className="metric">
            <div className="label">Price</div>
            <div className="value">{formatPrice(trip.price)}</div>
          </div>
          <div className="metric">
            <div className="label">Booked seats</div>
            <div className="value">{trip.bookedSeats || 0}</div>
          </div>
          <div className="metric">
            <div className="label">Total seats</div>
            <div className="value">{trip.totalSeats || 0}</div>
          </div>
          <div className="metric">
            <div className="label">Available seats</div>
            <div className="value">{trip.availableSeats || 0}</div>
          </div>
          <div className="metric">
            <div className="label">Status</div>
            <div className="value">
              <span className={`status-badge ${getStatusClass(trip.status)}`}>
                {getStatusText(trip.status)}
              </span>
            </div>
          </div>
        </div>

        <button className="btn-edit-trip" title="Edit trip" onClick={() => navigate(`/trips/${id}/edit`)}>
          ✏️
        </button>
        {showEdit && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEdit(false)}
            onSave={(updated) => setTrip(updated)}
          />
        )}
      </div>

      <div className="travelers-section">
        <div className="section-header">
          <h2>List of Booking Travelers</h2>
          <div className="section-actions">
            <div className="search-box">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input 
                className="search-input" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-add-booking" onClick={() => navigate(`/bookings/new?tripId=${trip.id}`)}>
              <img src={addNewIcon} alt="Add" />
              Add new Booking for Trip
            </button>
          </div>
        </div>

        <div className="traveler-table-wrapper">
          <table className="traveler-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Booking Date</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingBookings ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    Loading bookings...
                  </td>
                </tr>
              ) : (() => {
                // Flatten bookings to show each traveler as a row
                const travelers = bookings.flatMap(booking => 
                  (booking.travelers || []).map((traveler, idx) => ({
                    ...traveler,
                    bookingId: booking.id,
                    bookingCreatedAt: booking.createdAt,
                    travelerIndex: idx
                  }))
                );
                
                const filtered = travelers.filter(t => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    t.fullName?.toLowerCase().includes(q) ||
                    t.email?.toLowerCase().includes(q) ||
                    t.phoneNumber?.toLowerCase().includes(q)
                  );
                });
                
                return filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      No travelers found for this trip
                    </td>
                  </tr>
                ) : (
                  filtered.map((traveler) => (
                    <tr key={traveler.id}>
                      <td>{traveler.bookingId?.substring(0, 8) || 'N/A'}</td>
                      <td>{traveler.fullName || 'N/A'}</td>
                      <td>{traveler.email || 'N/A'}</td>
                      <td>{traveler.phoneNumber || 'N/A'}</td>
                      <td>{formatDate(traveler.bookingCreatedAt)}</td>
                      <td style={{textAlign:'center'}}>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setModalTraveler(traveler);
                              setModalBookingId(traveler.bookingId);
                              setModalTravelerIndex(traveler.travelerIndex);
                              setShowEditModal(true);
                            }}
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12.75 3L15 5.25L4.5 15.75L1.5 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="btn-cancel-booking"
                            onClick={() => handleDeleteTraveler(traveler.bookingId, traveler.id, traveler.fullName)}
                            title="Delete"
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && (
        <EditPassengerModal
          traveler={modalTraveler}
          bookingId={modalBookingId}
          travelerIndex={modalTravelerIndex}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default TripDetailPage;
