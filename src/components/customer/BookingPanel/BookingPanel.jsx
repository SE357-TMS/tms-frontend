import React, { useState, useMemo } from 'react';
import DatePicker from '../DatePicker/DatePicker';
import './BookingPanel.css';

export default function BookingPanel({
  selectedTrip,
  availableTrips,
  availableDates,
  quantity,
  isInCart,
  isAuthenticated,
  routeDuration,
  onTripChange,
  onQuantityChange,
  onAddToCart,
  onBookNow,
  onViewPassengerInfo
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format price in VND
  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    const selectedDateStr = date.toISOString().split('T')[0];
    const trip = availableTrips.find(t => t.departureDate === selectedDateStr);
    if (trip) {
      onTripChange(trip);
    }
    setShowDatePicker(false);
  };

  // Get trip info display
  const tripInfo = useMemo(() => {
    if (!selectedTrip) return null;
    
    const duration = routeDuration ? `${routeDuration - 1}N${routeDuration}D` : 'N/A';
    
    return {
      departureCity: selectedTrip.pickUpLocation?.split(',')[0] || 'N/A',
      destination: 'N/A', // Would need to be passed from route
      duration,
      endDate: selectedTrip.returnDate,
      availableSeats: selectedTrip.availableSeats,
      pickUpLocation: selectedTrip.pickUpLocation,
      pickUpTime: selectedTrip.pickUpTime
    };
  }, [selectedTrip, routeDuration]);

  // Calculate total amount
  const totalAmount = selectedTrip ? selectedTrip.price * quantity : 0;

  // Check if buttons should be disabled
  const isButtonDisabled = !selectedTrip || quantity <= 0;

  return (
    <div className="booking-panel">
      <h2 className="booking-title">BOOK TICKETS</h2>
      
      {/* Departure Date */}
      <div className="booking-field">
        <label>Departure date:</label>
        <div className="date-selector" onClick={() => setShowDatePicker(!showDatePicker)}>
          <span>{selectedTrip ? formatDate(selectedTrip.departureDate) : 'Select date'}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.66667 1.66667V4.16667M13.3333 1.66667V4.16667M2.91667 7.575H17.0833M17.5 7.08333V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08333C2.5 4.58333 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58333 17.5 7.08333Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {showDatePicker && (
          <DatePicker
            selectedDate={selectedTrip ? new Date(selectedTrip.departureDate) : null}
            availableDates={availableDates}
            onSelect={handleDateSelect}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </div>
      
      {/* Ticket Price */}
      <div className="booking-field">
        <label>Ticket price:</label>
        <div className="price-display">
          <span className="price">{formatPrice(selectedTrip?.price)}</span>
          <span className="per-guest">/ Guest</span>
        </div>
      </div>
      
      {/* Quantity */}
      <div className="booking-field">
        <label>Quantity:</label>
        <div className="quantity-selector">
          <span className="quantity-label">People</span>
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 0}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              min="0"
              max={selectedTrip?.availableSeats || 0}
              className="quantity-input"
            />
            <button 
              className="quantity-btn"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= (selectedTrip?.availableSeats || 0)}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Total Amount */}
      <div className="booking-total">
        <span className="total-label">Total amount:</span>
        <span className="total-amount">{formatPrice(totalAmount)}</span>
      </div>
      
      {/* Action Buttons */}
      <div className="booking-actions">
        <button 
          className="btn-add-cart"
          onClick={onAddToCart}
          disabled={isButtonDisabled}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.66667 18.3333C7.12691 18.3333 7.5 17.9602 7.5 17.5C7.5 17.0398 7.12691 16.6667 6.66667 16.6667C6.20643 16.6667 5.83334 17.0398 5.83334 17.5C5.83334 17.9602 6.20643 18.3333 6.66667 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.8333 18.3333C16.2936 18.3333 16.6667 17.9602 16.6667 17.5C16.6667 17.0398 16.2936 16.6667 15.8333 16.6667C15.3731 16.6667 15 17.0398 15 17.5C15 17.9602 15.3731 18.3333 15.8333 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M0.833344 0.833336H4.16668L6.40001 11.9917C6.47621 12.3754 6.68495 12.7201 6.98963 12.9653C7.29431 13.2105 7.67559 13.3409 8.06668 13.3333H15.3333C15.7244 13.3409 16.1057 13.2105 16.4104 12.9653C16.7151 12.7201 16.9238 12.3754 17 11.9917L18.3333 5.00001H5.00001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className="btn-book-now"
          onClick={onBookNow}
          disabled={isButtonDisabled}
        >
          Book now
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Enter Passenger Info Button */}
      {isAuthenticated && isInCart && selectedTrip && (
        <button 
          className="btn-passenger-info"
          onClick={onViewPassengerInfo}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3333 17.5V15.8333C13.3333 14.9493 12.9821 14.1014 12.357 13.4763C11.7319 12.8512 10.884 12.5 10 12.5H5C4.11595 12.5 3.26811 12.8512 2.64299 13.4763C2.01787 14.1014 1.66667 14.9493 1.66667 15.8333V17.5M16.6667 6.66667V11.6667M19.1667 9.16667H14.1667M10.4167 5.83333C10.4167 7.67428 8.92428 9.16667 7.08333 9.16667C5.24238 9.16667 3.75 7.67428 3.75 5.83333C3.75 3.99238 5.24238 2.5 7.08333 2.5C8.92428 2.5 10.4167 3.99238 10.4167 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Enter passenger information
        </button>
      )}
      
      {/* Trip Information */}
      {selectedTrip && tripInfo && (
        <div className="trip-info-section">
          <h3 className="trip-info-title">TRIP INFORMATION</h3>
          
          <div className="trip-info-list">
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6366F1" strokeWidth="1.5"/>
                <path d="M10 17.5C13.3333 14.1667 16.6667 11.0152 16.6667 8.33333C16.6667 4.65143 13.6819 1.66667 10 1.66667C6.31811 1.66667 3.33333 4.65143 3.33333 8.33333C3.33333 11.0152 6.66667 14.1667 10 17.5Z" stroke="#6366F1" strokeWidth="1.5"/>
              </svg>
              <span className="info-label">Departure:</span>
              <span className="info-value">City. {tripInfo.departureCity}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6366F1" strokeWidth="1.5"/>
                <path d="M10 17.5C13.3333 14.1667 16.6667 11.0152 16.6667 8.33333C16.6667 4.65143 13.6819 1.66667 10 1.66667C6.31811 1.66667 3.33333 4.65143 3.33333 8.33333C3.33333 11.0152 6.66667 14.1667 10 17.5Z" stroke="#6366F1" strokeWidth="1.5"/>
              </svg>
              <span className="info-label">Destination:</span>
              <span className="info-value">{tripInfo.destination}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 5V10L13.3333 11.6667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="info-label">Time:</span>
              <span className="info-value">{tripInfo.duration}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.66667 1.66667V4.16667M13.3333 1.66667V4.16667M2.91667 7.575H17.0833M17.5 7.08333V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08333C2.5 4.58333 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58333 17.5 7.08333Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="info-label">End date:</span>
              <span className="info-value">{formatDate(tripInfo.endDate)}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 8.33333C16.6667 13.3333 10 18.3333 10 18.3333C10 18.3333 3.33333 13.3333 3.33333 8.33333C3.33333 6.56522 4.03571 4.86953 5.28595 3.61929C6.5362 2.36905 8.23189 1.66667 10 1.66667C11.7681 1.66667 13.4638 2.36905 14.714 3.61929C15.9643 4.86953 16.6667 6.56522 16.6667 8.33333Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="info-label">Number of seats available:</span>
              <span className="info-value">{tripInfo.availableSeats}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6366F1" strokeWidth="1.5"/>
                <path d="M10 17.5C13.3333 14.1667 16.6667 11.0152 16.6667 8.33333C16.6667 4.65143 13.6819 1.66667 10 1.66667C6.31811 1.66667 3.33333 4.65143 3.33333 8.33333C3.33333 11.0152 6.66667 14.1667 10 17.5Z" stroke="#6366F1" strokeWidth="1.5"/>
              </svg>
              <span className="info-label">Departure location:</span>
              <span className="info-value">{tripInfo.pickUpLocation}</span>
            </div>
            
            <div className="trip-info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 5V10L13.3333 11.6667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="info-label">Departure time:</span>
              <span className="info-value">{tripInfo.pickUpTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
