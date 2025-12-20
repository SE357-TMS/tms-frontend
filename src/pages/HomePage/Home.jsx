import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import customerTourService from "../../services/customerTourService";
import "./HomePage.css";

// Import icons
import SearchIcon from "../../assets/icons/searchicon.svg";
import CalendarIcon from "../../assets/icons/calendardate.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import AlarmClockIcon from "../../assets/icons/alarmclock.svg";
import LeftArrow from "../../assets/icons/left.svg";
import RightArrow from "../../assets/icons/right.svg";

// Budget options
const BUDGET_OPTIONS = [
  { label: "Under 5M", value: "under5" },
  { label: "5M - 10M", value: "5to10" },
  { label: "10M - 50M", value: "10to50" },
  { label: "Over 50M", value: "over50" },
];

const TOUR_LIMIT = 5;
const DESTINATION_LIMIT = 8;

// Helper function to format price
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

// Helper function to format date
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Get min date (3 days from today)
const getMinDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split("T")[0];
};

export default function HomePage() {
  const navigate = useNavigate();
  useAuth();

  // State for search engine
  const [searchKeyword, setSearchKeyword] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [budget, setBudget] = useState("");
  const [suggestions, setSuggestions] = useState({ routes: [], attractions: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // State for home page data
  const [favoriteTours, setFavoriteTours] = useState([]);
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinationImages, setDestinationImages] = useState({});

  // State for sliders
  const [tourDateIndexes, setTourDateIndexes] = useState({});
  const [destScrollIndex, setDestScrollIndex] = useState(0);
  const destSliderRef = useRef(null);

  const loadDestinationImages = useCallback(async () => {
    try {
      setDestinationImages({});
      const response = await customerTourService.getFavoriteDestinationImages(DESTINATION_LIMIT);
      if (Array.isArray(response)) {
        const map = response.reduce((acc, item) => {
          if (item?.attractionId) {
            acc[item.attractionId] = item.image;
          }
          return acc;
        }, {});
        setDestinationImages(map);
      }
    } catch (error) {
      console.error("Error fetching destination images:", error);
    }
  }, []);

  // Fetch home page data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await customerTourService.getHomePageData(TOUR_LIMIT, DESTINATION_LIMIT);
        if (response) {
          setFavoriteTours(response.favoriteTours || []);
          setFavoriteDestinations(response.favoriteDestinations || []);
        }
        loadDestinationImages();
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [loadDestinationImages]);

  // Debounced search suggestions
  const debounceRef = useRef(null);
  const fetchSuggestions = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      setSuggestions({ routes: [], attractions: [] });
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await customerTourService.getSearchSuggestions(keyword, 5);
      setSuggestions(response || { routes: [], attractions: [] });
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append("keyword", searchKeyword.trim());
    if (departureDate) params.append("departureDate", departureDate);
    if (budget) {
      const budgetRanges = {
        under5: [0, 5000000],
        "5to10": [5000000, 10000000],
        "10to50": [10000000, 50000000],
        over50: [50000000, null],
      };
      const [minPrice, maxPrice] = budgetRanges[budget] || [null, null];
      if (minPrice !== null) params.append("minPrice", minPrice);
      if (maxPrice !== null) params.append("maxPrice", maxPrice);
    }
    navigate(`/search?${params.toString()}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (type, item) => {
    if (type === "route") {
      navigate(`/routes/${item.id}`);
    } else {
      navigate(`/search?attractionId=${item.id}`);
    }
    setShowSuggestions(false);
  };

  // Handle tour card click
  const handleTourClick = (routeId) => {
    navigate(`/routes/${routeId}`);
  };

  // Handle destination click
  const handleDestinationClick = (attractionId) => {
    navigate(`/search?attractionId=${attractionId}`);
  };

  // Handle tour date navigation
  const handleTourDateNav = (routeId, direction, maxIndex) => {
    setTourDateIndexes((prev) => {
      const current = prev[routeId] || 0;
      let newIndex = current + direction;
      if (newIndex < 0) newIndex = 0;
      if (newIndex > maxIndex) newIndex = maxIndex;
      return { ...prev, [routeId]: newIndex };
    });
  };

  // Handle destination slider navigation
  const handleDestNav = (direction) => {
    if (!destSliderRef.current) return;
    const visibleCards = 5;
    const maxIndex = Math.max(0, favoriteDestinations.length - visibleCards);
    
    setDestScrollIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = 0;
      if (newIndex > maxIndex) newIndex = maxIndex;
      return newIndex;
    });
  };

  // Scroll destination slider
  useEffect(() => {
    if (destSliderRef.current) {
      destSliderRef.current.scrollTo({
        left: destScrollIndex * 192,
        behavior: "smooth",
      });
    }
  }, [destScrollIndex]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://res.cloudinary.com/dan4nktek/image/upload/v1766121167/tms/routes/route_1cda2517-d17e-11f0-a8b5-7a730f1d47a5_main.jpg"
            alt="Hero Background"
          />
        </div>
        <div className="hero-content">
          <h1>Your world of joy</h1>
          <p>
            From local escapes to far-flung adventures, find what makes you happy anytime, anywhere
          </p>
        </div>

        {/* Booking Widget / Search Engine */}
        <div className="booking-widget">
          <div className="widget-item search-field">
            <label className="widget-label">Where do you want to go?*</label>
            <div className="input-group" ref={searchInputRef}>
              <input
                type="text"
                placeholder="Search with any landmarks you love"
                value={searchKeyword}
                onChange={handleSearchInputChange}
                onFocus={() => searchKeyword && setShowSuggestions(true)}
              />
            </div>
            {showSuggestions && (suggestions.routes?.length > 0 || suggestions.attractions?.length > 0) && (
              <div className="suggestions-dropdown" ref={suggestionsRef}>
                {suggestions.routes?.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">Routes</div>
                    {suggestions.routes.map((route) => (
                      <div
                        key={route.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick("route", route)}
                      >
                        <span className="suggestion-name">{route.name}</span>
                        <span className="suggestion-detail">
                          {route.startLocation} → {route.endLocation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {suggestions.attractions?.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">Attractions</div>
                    {suggestions.attractions.map((attraction) => (
                      <div
                        key={attraction.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick("attraction", attraction)}
                      >
                        <span className="suggestion-name">{attraction.name}</span>
                        <span className="suggestion-detail">{attraction.location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="widget-item">
            <label className="widget-label">Departure date</label>
            <div className="input-group">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={getMinDate()}
              />
            </div>
          </div>

          <div className="widget-item">
            <label className="widget-label">Budget</label>
            <div className="input-group">
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className="contrast-select">
                <option value="">Choose your price</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="search-btn-large" onClick={handleSearch}>
            <img src={SearchIcon} alt="Search" />
          </button>
        </div>
      </section>

      {/* Favorite Travel Choice Section */}
      <section className="section favorites">
        <div className="container">
          <h2 className="section-title">Favorite travel choice</h2>

          {loading ? (
            <div className="loading-state">Loading tours...</div>
          ) : (
            <div className="card-grid">
              {favoriteTours.map((tour) => {
                const dateIndex = tourDateIndexes[tour.routeId] || 0;
                const trips = tour.upcomingTrips || [];
                const visibleTrips = trips.slice(dateIndex, dateIndex + 3);
                const maxDateIndex = Math.max(0, trips.length - 3);

                return (
                  <div
                    key={tour.routeId}
                    className="card"
                    onClick={() => handleTourClick(tour.routeId)}
                  >
                    <div className="card-img">
                      <img src={tour.image || "https://via.placeholder.com/220x140"} alt={tour.routeName} />
                      <div className="wishlist-icon">
                        <img src={HeartIcon} alt="Favorite" />
                      </div>
                    </div>
                    <div className="card-body">
                      <span className="category">{tour.endLocation}</span>
                      <h3 className="title">{tour.routeName}</h3>
                      
                      {/* Departure dates slider */}
                      {trips.length > 0 && (
                        <div className="departure-dates">
                          {trips.length > 3 && (
                            <button
                              className="date-nav-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTourDateNav(tour.routeId, -1, maxDateIndex);
                              }}
                              disabled={dateIndex === 0}
                            >
                              <img src={LeftArrow} alt="Previous" />
                            </button>
                          )}
                          <div className="date-tags">
                            {visibleTrips.map((trip) => (
                              <span key={trip.tripId} className="date-tag">
                                {formatDate(trip.startDate)}
                              </span>
                            ))}
                          </div>
                          {trips.length > 3 && (
                            <button
                              className="date-nav-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTourDateNav(tour.routeId, 1, maxDateIndex);
                              }}
                              disabled={dateIndex >= maxDateIndex}
                            >
                              <img src={RightArrow} alt="Next" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="meta">
                        <img src={AlarmClockIcon} alt="Duration" />
                        <span>{tour.durationDays}N{tour.durationDays - 1}Đ</span>
                      </div>
                      <div className="price-action">
                        <span className="price-label">Price from:</span>
                        <span className="price">{formatPrice(tour.minPrice)} VND</span>
                        <button
                          className="book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTourClick(tour.routeId);
                          }}
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="see-more-container">
            <button className="see-more-btn" onClick={() => navigate("/search")}>
              See More
            </button>
          </div>
        </div>
      </section>

      {/* Favorite Destinations Section */}
      <section className="section destinations">
        <div className="container">
          <div className="header-row">
            <h2 className="section-title">List of favorite tourist destinations</h2>
          </div>

          <div className="dest-slider-container">
            <button
              className="arrow-btn"
              onClick={() => handleDestNav(-1)}
              disabled={destScrollIndex === 0}
            >
              <img src={LeftArrow} alt="Previous" />
            </button>
            <div className="dest-grid" ref={destSliderRef}>
              {favoriteDestinations.map((dest) => {
                const imageUrl =
                  destinationImages[dest.attractionId] ||
                  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=60";

                return (
                  <div
                    key={dest.attractionId}
                    className="dest-card"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                    onClick={() => handleDestinationClick(dest.attractionId)}
                  >
                    <div className="dest-overlay">
                      <h3>{dest.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="arrow-btn"
              onClick={() => handleDestNav(1)}
              disabled={destScrollIndex >= favoriteDestinations.length - 5}
            >
              <img src={RightArrow} alt="Next" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
