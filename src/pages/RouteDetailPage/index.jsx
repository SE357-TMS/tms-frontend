import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ImageSlider from '../../components/customer/ImageSlider/ImageSlider';
import BookingPanel from '../../components/customer/BookingPanel/BookingPanel';
import ItinerarySlider from '../../components/customer/ItinerarySlider/ItinerarySlider';
import routeService from '../../services/routeService';
import tripService from '../../services/tripService';
import cartService from '../../services/cartService';
import './RouteDetailPage.css';

export default function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [routeDetail, setRouteDetail] = useState(null);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch route details and available trips
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch route details
        const routeResponse = await routeService.getRouteDetail(id);
        if (routeResponse.data) {
          setRouteDetail(routeResponse.data);
        }

        // Fetch available trips for this route
        const tripsResponse = await tripService.getAvailableTripsByRoute(id);
        if (tripsResponse.data && tripsResponse.data.length > 0) {
          setAvailableTrips(tripsResponse.data);
          // Select the nearest trip by default
          setSelectedTrip(tripsResponse.data[0]);
        }
      } catch (err) {
        console.error('Error fetching route data:', err);
        setError('Failed to load route details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Check if selected trip is in cart when trip changes
  useEffect(() => {
    const checkCartStatus = async () => {
      if (selectedTrip && isAuthenticated) {
        try {
          const response = await cartService.checkTripInCart(selectedTrip.tripId);
          setIsInCart(response.data === true);
        } catch (err) {
          console.error('Error checking cart status:', err);
          setIsInCart(false);
        }
      } else {
        setIsInCart(false);
      }
    };

    checkCartStatus();
  }, [selectedTrip, isAuthenticated]);

  // Get available dates for date picker
  const availableDates = useMemo(() => {
    return availableTrips.map(trip => trip.departureDate);
  }, [availableTrips]);

  // Get route images
  const routeImages = useMemo(() => {
    if (!routeDetail?.images || routeDetail.images.length === 0) {
      return ['/placeholder-image.jpg'];
    }
    return routeDetail.images;
  }, [routeDetail]);

  // Handle trip change
  const handleTripChange = (trip) => {
    setSelectedTrip(trip);
    setQuantity(1); // Reset quantity when trip changes
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    const maxSeats = selectedTrip?.availableSeats || 0;
    if (newQuantity >= 0 && newQuantity <= maxSeats) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/routes/${id}`);
      return;
    }

    if (!selectedTrip || quantity <= 0) {
      return;
    }

    try {
      await cartService.addToCart({
        tripId: selectedTrip.tripId,
        quantity
      });
      setIsInCart(true);
      alert('Added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Handle book now (add to cart and go to checkout)
  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/routes/${id}`);
      return;
    }

    if (!selectedTrip || quantity <= 0) {
      return;
    }

    try {
      if (!isInCart) {
        await cartService.addToCart({
          tripId: selectedTrip.tripId,
          quantity
        });
      }
      navigate('/checkout');
    } catch (err) {
      console.error('Error booking:', err);
      alert(err.response?.data?.message || 'Failed to book');
    }
  };

  // Handle view passenger info
  const handleViewPassengerInfo = () => {
    if (selectedTrip) {
      navigate(`/passenger-info/${selectedTrip.tripId}`);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/routes/${id}`);
      return;
    }
    
    // TODO: Implement favorite API call
    setIsFavorite(!isFavorite);
  };

  // Loading state
  if (loading) {
    return (
      <div className="route-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading route details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="route-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Not found state
  if (!routeDetail) {
    return (
      <div className="route-detail-not-found">
        <h2>Route Not Found</h2>
        <p>The route you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="route-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')}>Home</span>
        <span className="separator">/</span>
        <span onClick={() => navigate('/routes')}>Routes</span>
        <span className="separator">/</span>
        <span className="current">{routeDetail.name}</span>
      </div>

      <div className="route-detail-content">
        {/* Left Column - Images and Itinerary */}
        <div className="route-detail-left">
          {/* Image Slider */}
          <ImageSlider
            images={routeImages}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Route Info */}
          <div className="route-info-section">
            <h1 className="route-name">{routeDetail.name}</h1>
            {routeDetail.description && (
              <p className="route-description">{routeDetail.description}</p>
            )}
            
            <div className="route-highlights">
              <div className="highlight-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 5V10L13.3333 11.6667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{routeDetail.duration || routeDetail.itinerary?.length || 0} Days</span>
              </div>
              {routeDetail.totalAttractions && (
                <div className="highlight-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z" stroke="#6366F1" strokeWidth="1.5"/>
                    <path d="M10 17.5C13.3333 14.1667 16.6667 11.0152 16.6667 8.33333C16.6667 4.65143 13.6819 1.66667 10 1.66667C6.31811 1.66667 3.33333 4.65143 3.33333 8.33333C3.33333 11.0152 6.66667 14.1667 10 17.5Z" stroke="#6366F1" strokeWidth="1.5"/>
                  </svg>
                  <span>{routeDetail.totalAttractions} Attractions</span>
                </div>
              )}
            </div>
          </div>

          {/* Itinerary Slider */}
          <ItinerarySlider itinerary={routeDetail.itinerary || []} />
        </div>

        {/* Right Column - Booking Panel */}
        <div className="route-detail-right">
          <BookingPanel
            selectedTrip={selectedTrip}
            availableTrips={availableTrips}
            availableDates={availableDates}
            quantity={quantity}
            isInCart={isInCart}
            isAuthenticated={isAuthenticated}
            routeDuration={routeDetail.duration || routeDetail.itinerary?.length}
            onTripChange={handleTripChange}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            onBookNow={handleBookNow}
            onViewPassengerInfo={handleViewPassengerInfo}
          />
        </div>
      </div>
    </div>
  );
}
