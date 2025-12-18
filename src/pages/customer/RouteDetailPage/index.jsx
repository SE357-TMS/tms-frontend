import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import routeService from '../../../services/routeService';
import tripService from '../../../services/tripService';
import cartService from '../../../services/cartService';
import customerTourService from '../../../services/customerTourService';
import ImageSlider from '../../../components/customer/ImageSlider/ImageSlider';
import BookingPanel from '../../../components/customer/BookingPanel/BookingPanel';
import ItinerarySlider from '../../../components/customer/ItinerarySlider/ItinerarySlider';
import './RouteDetailPage.css';

export default function RouteDetailPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get tripId from URL query param (when user clicks a specific departure date)
  const selectedTripIdFromUrl = searchParams.get('tripId');
  
  const [routeDetail, setRouteDetail] = useState(null);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [quantity, setQuantity] = useState(0);
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
        
        // Fetch route detail
        const routeResponse = await routeService.getRouteDetail(routeId);
        if (routeResponse.data && routeResponse.data.data) {
          setRouteDetail(routeResponse.data.data);
        } else if (routeResponse.data) {
          setRouteDetail(routeResponse.data);
        }
        
        // Fetch available trips
        const tripsResponse = await tripService.getAvailableTripsByRoute(routeId);
        const tripsData = tripsResponse.data?.data || tripsResponse.data || [];
        setAvailableTrips(tripsData);
        
        // Set selected trip based on URL param or nearest available
        if (tripsData.length > 0) {
          if (selectedTripIdFromUrl) {
            const tripFromUrl = tripsData.find(t => t.tripId === parseInt(selectedTripIdFromUrl));
            if (tripFromUrl) {
              setSelectedTrip(tripFromUrl);
            } else {
              setSelectedTrip(tripsData.find(t => t.availableSeats > 0) || tripsData[0]);
            }
          } else {
            const nearestTrip = tripsData.find(t => t.availableSeats > 0) || tripsData[0];
            setSelectedTrip(nearestTrip);
          }
        }
        
        // Check if route is favorited
        if (isAuthenticated) {
          try {
            const favoriteStatus = await customerTourService.checkFavorite(routeId);
            setIsFavorite(favoriteStatus.data?.data?.isFavorited || false);
          } catch (err) {
            console.error('Error checking favorite status:', err);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load route details');
        console.error('Error fetching route details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [routeId, selectedTripIdFromUrl, isAuthenticated]);

  // Check if selected trip is in cart
  useEffect(() => {
    const checkCart = async () => {
      if (isAuthenticated && selectedTrip) {
        try {
          const result = await cartService.hasTripInCart(selectedTrip.tripId);
          setIsInCart(result);
        } catch (err) {
          console.error('Error checking cart:', err);
          setIsInCart(false);
        }
      } else {
        setIsInCart(false);
      }
    };
    
    checkCart();
  }, [selectedTrip, isAuthenticated]);

  // Handle trip selection change
  const handleTripChange = (trip) => {
    setSelectedTrip(trip);
    setQuantity(0); // Reset quantity when changing trip
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (selectedTrip) {
      const maxAllowed = selectedTrip.availableSeats;
      setQuantity(Math.max(0, Math.min(newQuantity, maxAllowed)));
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/routes/${routeId}` } });
      return;
    }
    
    if (quantity <= 0 || !selectedTrip) return;
    
    try {
      await cartService.addToCart(selectedTrip.tripId, quantity);
      setIsInCart(true);
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  // Handle book now
  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/routes/${routeId}` } });
      return;
    }
    
    if (quantity <= 0 || !selectedTrip) return;
    
    try {
      await cartService.addToCart(selectedTrip.tripId, quantity);
      navigate('/checkout');
    } catch (err) {
      alert(err.message || 'Failed to proceed to checkout');
    }
  };

  // Handle view passenger info
  const handleViewPassengerInfo = () => {
    if (selectedTrip && isInCart) {
      navigate(`/cart/passengers/${selectedTrip.tripId}`);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/routes/${routeId}` } });
      return;
    }
    
    try {
      await customerTourService.toggleFavorite(routeId);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite status');
    }
  };

  // Get available dates for calendar
  const availableDates = useMemo(() => {
    return availableTrips.map(trip => trip.departureDate);
  }, [availableTrips]);

  if (loading) {
    return (
      <div className="route-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading route details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="route-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!routeDetail) {
    return (
      <div className="route-detail-error">
        <h2>Route Not Found</h2>
        <p>The requested route could not be found.</p>
        <button onClick={() => navigate('/home')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="route-detail-page">
      {/* Route Title */}
      <h1 className="route-title">{routeDetail.routeName}</h1>
      
      {/* Main Content */}
      <div className="route-detail-content">
        {/* Left Section - Image Slider */}
        <div className="route-detail-left">
          <div className="image-slider-container">
            <ImageSlider 
              images={routeDetail.images || []}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
        
        {/* Right Section - Booking Panel */}
        <div className="route-detail-right">
          <BookingPanel
            selectedTrip={selectedTrip}
            availableTrips={availableTrips}
            availableDates={availableDates}
            quantity={quantity}
            isInCart={isInCart}
            isAuthenticated={isAuthenticated}
            routeDuration={routeDetail.durationDays}
            onTripChange={handleTripChange}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            onBookNow={handleBookNow}
            onViewPassengerInfo={handleViewPassengerInfo}
          />
        </div>
      </div>
      
      {/* Itinerary Section */}
      <div className="route-itinerary-section">
        <ItinerarySlider 
          itinerary={routeDetail.itinerary || []}
          durationDays={routeDetail.durationDays}
        />
      </div>
    </div>
  );
}
