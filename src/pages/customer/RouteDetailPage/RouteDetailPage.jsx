import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import routeService from "../../../services/routeService";
import tripService from "../../../services/tripService";
import cartService from "../../../services/cartService";
import Swal from "sweetalert2";
import "./RouteDetailPage.css";
import imageService from "../../../services/imageService";

// Import icons
import HeartIcon from "../../../assets/icons/heart.svg";
import LeftArrow from "../../../assets/icons/left.svg";
import RightArrow from "../../../assets/icons/right.svg";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import AddPersonIcon from "../../../assets/icons/addperson.svg";
import MarkerPinIcon from "../../../assets/icons/markerpin.svg";
import AlarmClockIcon from "../../../assets/icons/alarmclock.svg";
import ShoppingCartIcon from "../../../assets/icons/shoppingcart.svg";

// Category tag colors
const CATEGORY_COLORS = {
  Airport: "#4D40CA",
  "Rivers and": "#4275AF",
  Hotel: "#4D40CA",
  "Historical site": "#2C3E50",
  Beach: "#4275AF",
  "Craft village": "#2C3E50",
  default: "#4D40CA",
};

// Helper functions
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateStr, format = "full") => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (format === "short") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};



export default function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Route & Trip data
  const [route, setRoute] = useState(null);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [routeImages, setRouteImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hasTripInCart, setHasTripInCart] = useState(false);

  // Image slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Itinerary slider state
  const [itineraryStartIndex, setItineraryStartIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch route details
  useEffect(() => {
    const fetchRouteDetail = async () => {
      try {
        setLoading(true);
        const response = await routeService.getRouteDetail(id);
        const routePayload = response?.data?.data;
        if (routePayload) {
          setRoute(routePayload);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        Swal.fire("Error", "Failed to load route details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRouteDetail();
  }, [id]);

  // Fetch available trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await tripService.getAvailableTripsByRoute(id);
        const tripsPayload = response?.data?.data;
        if (Array.isArray(tripsPayload)) {
          setAvailableTrips(tripsPayload);
          // Select nearest trip by default
          if (tripsPayload.length > 0) {
            setSelectedTrip(tripsPayload[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };
    fetchTrips();
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchRouteImages = async () => {
      try {
        const response = await imageService.getRouteImages(id);
        const payload = response?.data?.data;
        if (!isMounted) return;
        if (Array.isArray(payload) && payload.length > 0) {
          setRouteImages(payload);
        }
      } catch (error) {
        console.error("Error fetching route images:", error);
      }
    };

    setRouteImages([]);
    fetchRouteImages();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check if selected trip is in cart
  useEffect(() => {
    const checkCart = async () => {
      if (selectedTrip && isAuthenticated) {
        try {
          const response = await cartService.hasTripInCart(selectedTrip.tripId);
          setHasTripInCart(response?.data || false);
        } catch {
          setHasTripInCart(false);
        }
      } else {
        setHasTripInCart(false);
      }
    };
    checkCart();
  }, [selectedTrip, isAuthenticated]);

  // Calculate total price
  useEffect(() => {
    if (selectedTrip && quantity > 0) {
      setTotalPrice(selectedTrip.price * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedTrip, quantity]);

  // Handle image navigation
  const handleImageNav = (direction) => {
    const availableImages = routeImages.length ? routeImages : route?.images || [];
    if (availableImages.length === 0) return;

    setCurrentImageIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = availableImages.length - 1;
      if (newIndex >= availableImages.length) newIndex = 0;
      return newIndex;
    });
  };

  // Handle itinerary navigation
  const handleItineraryNav = (direction) => {
    const days = route?.itinerary?.length || 0;
    const maxStart = Math.max(0, days - 3);

    setItineraryStartIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = 0;
      if (newIndex > maxStart) newIndex = maxStart;
      return newIndex;
    });
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setQuantity(0);
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    if (!selectedTrip) return;
    const maxSeats = selectedTrip.availableSeats || 0;
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 0) return 0;
      if (newQty > maxSeats) return maxSeats;
      return newQty;
    });
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) {
      setQuantity(0);
    } else if (selectedTrip && value > selectedTrip.availableSeats) {
      setQuantity(selectedTrip.availableSeats);
    } else {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your cart",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4D40CA",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!selectedTrip || quantity <= 0) return;

    try {
      await cartService.addToCart(selectedTrip.tripId, quantity);
      Swal.fire({
        title: "Success!",
        text: "Trip added to cart successfully",
        icon: "success",
        confirmButtonColor: "#4D40CA",
      });
      setHasTripInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire("Error", "Failed to add to cart", "error");
    }
  };

  // Handle book now
  const handleBookNow = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to book a trip",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4D40CA",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!selectedTrip || quantity <= 0) return;

    try {
      await cartService.addToCart(selectedTrip.tripId, quantity);
      navigate("/cart");
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Failed to proceed", "error");
    }
  };

  // Handle passenger info
  const handlePassengerInfo = () => {
    if (selectedTrip) {
      navigate(`/cart/passengers/${selectedTrip.tripId}`);
    }
  };

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const routeMediaImages = useMemo(() => {
    const seen = new Set();
    const collected = [];
    const pushImage = (img) => {
      if (img && !seen.has(img)) {
        seen.add(img);
        collected.push(img);
      }
    };

    if (Array.isArray(route?.images)) {
      route.images.forEach((img) => pushImage(img));
    }
    pushImage(route?.image);
    pushImage(route?.imageUrl);
    pushImage(route?.image_url);
    return collected;
  }, [route]);

  const galleryImages = routeImages.length
    ? routeImages
    : routeMediaImages.length
      ? routeMediaImages
      : ["https://via.placeholder.com/1000x400"];
  const currentImage = galleryImages[currentImageIndex] || "https://via.placeholder.com/1000x400";
  const visibleItinerary = (route?.itinerary || []).slice(
    itineraryStartIndex,
    itineraryStartIndex + 3
  );

  const MIN_ATTRACTIONS = 3;
  const ensureAttractions = (items = []) => {
    const normalized = [...items];
    while (normalized.length < MIN_ATTRACTIONS) {
      normalized.push({
        attractionName: "To be announced",
        categoryName: "Schedule",
        isPlaceholder: true,
      });
    }
    return normalized;
  };

  useEffect(() => {
    if (galleryImages.length === 0) return;
    if (currentImageIndex >= galleryImages.length) {
      setCurrentImageIndex(0);
    }
  }, [galleryImages, currentImageIndex]);

  const highlightedDates = useMemo(() => {
    return new Set(availableTrips.map((trip) => trip.departureDate));
  }, [availableTrips]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const blanks = firstDay.getDay();
    const days = [];
    for (let i = 0; i < blanks; i += 1) {
      days.push(null);
    }
    for (let day = 1; day <= lastDayOfMonth; day += 1) {
      days.push(new Date(year, month, day));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleCalendarNav = (direction) => {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
  };

  const handleCalendarDateClick = (date) => {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    const tripForDate = availableTrips.find((trip) => trip.departureDate === iso);
    if (tripForDate) {
      handleTripSelect(tripForDate);
      setCalendarMonth(date);
      setShowCalendar(false);
    }
  };

  if (loading) {
    return (
      <div className="route-detail-page">
        <div className="loading-state">Loading route details...</div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="route-detail-page">
        <div className="empty-state">Route not found</div>
      </div>
    );
  }

  // Calculate end date
  const endDate = selectedTrip
    ? new Date(
        new Date(selectedTrip.departureDate).getTime() +
          (route.durationDays - 1) * 24 * 60 * 60 * 1000
      )
    : null;

  return (
    <div className="route-detail-page">
      <div className="container">
        {/* Route Headline */}
        <h1 className="tour-headline">{route.routeName}</h1>

        <div className="tour-layout">
          {/* Left Content */}
          <div className="left-content">
            {/* Image Gallery */}
            <div className="gallery-container">
              <img src={currentImage} alt={route.routeName} className="main-image" />
              <div className="gallery-fade left"></div>
              <div className="gallery-fade right"></div>
              
              <button
                className="nav-btn prev"
                onClick={() => handleImageNav(-1)}
              >
                <img src={LeftArrow} alt="Previous" />
              </button>
              <button
                className="nav-btn next"
                onClick={() => handleImageNav(1)}
              >
                <img src={RightArrow} alt="Next" />
              </button>
              
              <div className="wishlist-btn">
                <img src={HeartIcon} alt="Favorite" />
              </div>
            </div>

            {/* Itinerary Section */}
            {route.itinerary && route.itinerary.length > 0 && (
              <div className="itinerary-section">
                <div className="itinerary-slider">
                  {route.itinerary.length > 3 && (
                    <button
                      className="card-nav prev"
                      onClick={() => handleItineraryNav(-1)}
                      disabled={itineraryStartIndex === 0}
                    >
                      <img src={LeftArrow} alt="Previous" />
                    </button>
                  )}

                  <div className="itinerary-cards">
                    {visibleItinerary.map((day) => (
                      <div key={day.day} className="day-card">
                        <h3 className="schedule-title">Schedule</h3>
                        <h3 className="day-title">* Day {day.day}</h3>
                        <div className="activity-group">
                          <div className="activity-list">
                            {ensureAttractions(day.attractions || []).map((attraction, idx) => {
                              const color =
                                CATEGORY_COLORS[attraction.categoryName] ||
                                CATEGORY_COLORS.default;
                              return (
                                <div
                                  key={idx}
                                  className={`activity-card ${attraction.isPlaceholder ? "placeholder" : ""}`}
                                >
                                  <span className="activity-name">
                                    {attraction.attractionName}
                                  </span>
                                  <span
                                    className="activity-category"
                                    style={{ backgroundColor: color }}
                                  >
                                    {attraction.categoryName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {route.itinerary.length > 3 && (
                    <button
                      className="card-nav next"
                      onClick={() => handleItineraryNav(1)}
                      disabled={
                        itineraryStartIndex >= route.itinerary.length - 3
                      }
                    >
                      <img src={RightArrow} alt="Next" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="right-sidebar">
            {/* Booking Widget */}
            <div className="booking-widget">
              <h2 className="widget-title">BOOK TICKETS</h2>

              {/* Departure Date Selection */}
              <div className="form-group">
                <div className="departure-top-row">
                  <label>Departure date:</label>
                  <button
                    type="button"
                    className={`calendar-toggle ${showCalendar ? "active" : ""}`}
                    onClick={() => setShowCalendar((prev) => !prev)}
                    aria-label="Show departure calendar"
                  >
                    <img src={CalendarIcon} alt="Toggle calendar" />
                  </button>
                </div>
                <div className="departure-dates-list">
                  {availableTrips.length === 0 ? (
                    <p className="no-trips">No available trips</p>
                  ) : (
                    <div className="trip-buttons">
                      {availableTrips.slice(0, 5).map((trip) => (
                        <button
                          key={trip.tripId}
                          className={`trip-date-btn ${
                            selectedTrip?.tripId === trip.tripId ? "active" : ""
                          }`}
                          onClick={() => handleTripSelect(trip)}
                        >
                          {formatDate(trip.departureDate, "short")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {showCalendar && (
                  <div className="calendar-widget">
                    <div className="calendar-header">
                      <div className="calendar-title">
                        <img src={CalendarIcon} alt="Calendar" />
                        <span>Departure calendar</span>
                      </div>
                      <div className="calendar-controls">
                        <button
                          type="button"
                          onClick={() => handleCalendarNav(-1)}
                          aria-label="Previous month"
                        >
                          <img src={LeftArrow} alt="Prev" />
                        </button>
                        <span className="calendar-month-label">{monthLabel}</span>
                        <button
                          type="button"
                          onClick={() => handleCalendarNav(1)}
                          aria-label="Next month"
                        >
                          <img src={RightArrow} alt="Next" />
                        </button>
                      </div>
                    </div>
                    <div className="calendar-grid calendar-weekdays">
                      {WEEKDAYS.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="calendar-grid calendar-days">
                      {calendarDays.map((date, idx) => {
                        const iso = date ? date.toISOString().split("T")[0] : null;
                        const isAvailable = iso && highlightedDates.has(iso);
                        const isSelected = selectedTrip && selectedTrip.departureDate === iso;
                        return (
                          <button
                            key={`${idx}-${iso || "empty"}`}
                            className={`calendar-cell ${isAvailable ? "available" : ""} ${
                              isSelected ? "selected" : ""
                            }`}
                            disabled={!isAvailable}
                            onClick={() => handleCalendarDateClick(date)}
                          >
                            {date ? date.getDate() : ""}
                            {isAvailable && <span className="calendar-dot" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ticket Price */}
              <div className="form-group price-row">
                <label>Ticket price:</label>
                <span className="price-single">
                  {formatPrice(selectedTrip?.price || 0)} ₫ / Guest
                </span>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label>Quantity:</label>
                <div className="quantity-control">
                  <span>
                    People (max: {selectedTrip?.availableSeats || 0})
                  </span>
                  <div className="counter">
                    <button
                      className="btn-minus"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="count"
                      value={quantity}
                      onChange={handleQuantityInput}
                      min={0}
                      max={selectedTrip?.availableSeats || 0}
                    />
                    <button
                      className="btn-plus"
                      onClick={() => handleQuantityChange(1)}
                      disabled={
                        !selectedTrip ||
                        quantity >= selectedTrip.availableSeats
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="total-row">
                <label>Total amount:</label>
                <span className="total-price">{formatPrice(totalPrice)} ₫</span>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-book-now"
                  onClick={handleAddToCart}
                  disabled={quantity <= 0 || !selectedTrip}
                >
                  <img src={ShoppingCartIcon} alt="Add to cart" />
                  <span className="sr-only">Add to cart</span>
                </button>
                <button
                  className="btn-book-primary"
                  onClick={handleBookNow}
                  disabled={quantity <= 0 || !selectedTrip}
                >
                  Book now
                </button>
              </div>
              <button
                className="btn-passenger-info"
                onClick={handlePassengerInfo}
                disabled={!hasTripInCart}
              >
                <img src={AddPersonIcon} alt="Passenger info" />
                Enter passenger information
              </button>
            </div>

            {/* Trip Information Widget */}
            {selectedTrip && (
              <div className="trip-info-widget">
                <h2 className="widget-title">TRIP INFORMATION</h2>
                <ul className="info-list">
                  <li>
                    <img src={MarkerPinIcon} alt="Departure" />
                    <span>
                      Departure: <strong>{route.startLocation}</strong>
                    </span>
                  </li>
                  <li>
                    <img src={MarkerPinIcon} alt="Destination" />
                    <span>
                      Destination: <strong>{route.endLocation}</strong>
                    </span>
                  </li>
                  <li>
                    <img src={AlarmClockIcon} alt="Duration" />
                    <span>
                      Time:{" "}
                      <strong>
                        {route.durationDays}N{route.durationDays - 1}Đ
                      </strong>
                    </span>
                  </li>
                  <li>
                    <img src={CalendarIcon} alt="Start Date" />
                    <span>
                      Start date:{" "}
                      <strong>{formatDate(selectedTrip.departureDate)}</strong>
                    </span>
                  </li>
                  {endDate && (
                    <li>
                      <img src={CalendarIcon} alt="End Date" />
                      <span>
                        End date:{" "}
                        <strong>{formatDate(endDate.toISOString())}</strong>
                      </span>
                    </li>
                  )}
                  <li>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4 4H16C17.1 4 18 4.9 18 6V14C18 15.1 17.1 16 16 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4ZM4 6V14H16V6H4Z"
                        fill="currentColor"
                      />
                      <path d="M6 8H8V10H6V8ZM6 11H8V13H6V11ZM9 8H11V10H9V8ZM9 11H11V13H9V11ZM12 8H14V10H12V8ZM12 11H14V13H12V11Z" fill="currentColor"/>
                    </svg>
                    <span>
                      Available seats:{" "}
                      <strong>{selectedTrip.availableSeats}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
