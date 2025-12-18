import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import customerTourService from '../../../services/customerTourService';
import './TourCard.css';

const TourCard = ({ tour, variant = 'grid' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(tour.isFavorited || false);
  const [favoriteCount, setFavoriteCount] = useState(tour.favoriteCount || 0);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      const response = await customerTourService.toggleFavorite(tour.routeId);
      // Response structure: { success, message, data: boolean (new favorite state) }
      if (response && response.success) {
        const newFavoriteState = response.data;
        setIsFavorited(newFavoriteState);
        setFavoriteCount(prev => newFavoriteState ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/routes/${tour.routeId}`);
  };

  const handleBookNow = (e, tripId = null) => {
    e.stopPropagation();
    if (tripId) {
      navigate(`/routes/${tour.routeId}?tripId=${tripId}`);
    } else {
      navigate(`/routes/${tour.routeId}`);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'đ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Grid variant (for home page)
  if (variant === 'grid') {
    return (
      <div className="tour-card-grid" onClick={handleCardClick}>
        <div className="tour-card-image">
          <img src={tour.image || '/placeholder-tour.jpg'} alt={tour.routeName} />
          <button 
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
          >
            <svg width="18" height="16" viewBox="0 0 18 16" fill={isFavorited ? '#B12222' : 'none'}>
              <path d="M9 14.5C9 14.5 1.5 10 1.5 5C1.5 2.5 3.5 1 5.5 1C7.5 1 9 3 9 3C9 3 10.5 1 12.5 1C14.5 1 16.5 2.5 16.5 5C16.5 10 9 14.5 9 14.5Z" 
                stroke={isFavorited ? '#B12222' : '#FFFFFF'} 
                strokeWidth="1.5" 
                fill={isFavorited ? '#B12222' : 'transparent'}
              />
            </svg>
          </button>
        </div>
        <div className="tour-card-content">
          <div className="tour-category">{tour.startLocation}</div>
          <h3 className="tour-name">{tour.routeName}</h3>
          
          {/* Date buttons */}
          <div className="tour-dates">
            {tour.upcomingTrips?.slice(0, 5).map((trip, index) => (
              <button 
                key={trip.tripId || index} 
                className="date-btn"
                onClick={(e) => handleBookNow(e, trip.tripId)}
              >
                {formatDate(trip.departureDate)}
              </button>
            ))}
          </div>
          
          <div className="tour-meta">
            <div className="tour-duration">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M9.5 17.4167C13.8723 17.4167 17.4167 13.8723 17.4167 9.5C17.4167 5.12766 13.8723 1.58333 9.5 1.58333C5.12766 1.58333 1.58333 5.12766 1.58333 9.5C1.58333 13.8723 5.12766 17.4167 9.5 17.4167Z" stroke="rgba(0,0,0,0.7)" strokeWidth="2"/>
                <path d="M9.5 4.75V9.5L12.6667 11.0833" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{tour.durationDays}N{tour.durationDays - 1}Đ</span>
            </div>
            {favoriteCount > 0 && (
              <div className="tour-favorite-count">
                <span>❤️ {favoriteCount}</span>
              </div>
            )}
          </div>
          
          <div className="tour-footer">
            <div className="tour-price">
              <span className="price-label">From:</span>
              <span className="price-value">{formatPrice(tour.minPrice)}</span>
            </div>
            <button className="book-btn" onClick={(e) => handleBookNow(e)}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List variant (for search results)
  return (
    <div className="tour-card-list" onClick={handleCardClick}>
      <div className="tour-card-list-image">
        <img src={tour.image || '/placeholder-tour.jpg'} alt={tour.routeName} />
        <button 
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
        >
          <svg width="22" height="20" viewBox="0 0 18 16" fill={isFavorited ? '#B12222' : 'none'}>
            <path d="M9 14.5C9 14.5 1.5 10 1.5 5C1.5 2.5 3.5 1 5.5 1C7.5 1 9 3 9 3C9 3 10.5 1 12.5 1C14.5 1 16.5 2.5 16.5 5C16.5 10 9 14.5 9 14.5Z" 
              stroke={isFavorited ? '#B12222' : '#FFFFFF'} 
              strokeWidth="1.5" 
              fill={isFavorited ? '#B12222' : 'transparent'}
            />
          </svg>
        </button>
      </div>
      <div className="tour-card-list-content">
        <h3 className="tour-name-list">{tour.routeName}</h3>
        
        <div className="tour-info-grid">
          <div className="tour-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 7V18H8V12H12V18H18V7L10 2Z" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
            </svg>
            <span>{tour.routeCode}</span>
          </div>
          <div className="tour-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
              <path d="M10 5V10L13.3333 11.6667" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{tour.durationDays} days {tour.durationDays - 1} nights</span>
          </div>
          <div className="tour-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 8.33333C17.5 14.1667 10 18.3333 10 18.3333C10 18.3333 2.5 14.1667 2.5 8.33333C2.5 6.34421 3.29018 4.43655 4.6967 3.03003C6.10322 1.62351 8.01088 0.833333 10 0.833333C11.9891 0.833333 13.8968 1.62351 15.3033 3.03003C16.7098 4.43655 17.5 6.34421 17.5 8.33333Z" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
              <circle cx="10" cy="8.33333" r="2.5" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
            </svg>
            <span>{tour.startLocation}</span>
          </div>
          <div className="tour-info-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 8.33333C17.5 14.1667 10 18.3333 10 18.3333C10 18.3333 2.5 14.1667 2.5 8.33333C2.5 6.34421 3.29018 4.43655 4.6967 3.03003C6.10322 1.62351 8.01088 0.833333 10 0.833333C11.9891 0.833333 13.8968 1.62351 15.3033 3.03003C16.7098 4.43655 17.5 6.34421 17.5 8.33333Z" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
              <circle cx="10" cy="8.33333" r="2.5" stroke="rgba(0,0,0,0.75)" strokeWidth="2"/>
            </svg>
            <span>{tour.endLocation}</span>
          </div>
        </div>

        {/* Departure date buttons */}
        <div className="tour-departures">
          <button className="nav-arrow prev">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M5 1L2 4L5 7" stroke="#000" strokeWidth="1"/>
            </svg>
          </button>
          {tour.upcomingTrips?.slice(0, 5).map((trip, index) => (
            <button 
              key={trip.tripId || index} 
              className="departure-date-btn"
              onClick={(e) => handleBookNow(e, trip.tripId)}
            >
              {formatDate(trip.departureDate)}
            </button>
          ))}
          <button className="nav-arrow next">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M3 1L6 4L3 7" stroke="#000" strokeWidth="1"/>
            </svg>
          </button>
        </div>

        <div className="tour-card-list-footer">
          <div className="price-section">
            <span className="price-label">From:</span>
            <span className="price-value-list">{formatPrice(tour.minPrice)}</span>
          </div>
          <button className="book-btn-list" onClick={(e) => handleBookNow(e)}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
