import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import customerTourService from '../../../services/customerTourService';
import './SearchBar.css';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Tìm kiếm tour, địa điểm...' }) => {
  const [keyword, setKeyword] = useState(initialValue);
  const [suggestions, setSuggestions] = useState({ routes: [], attractions: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Update keyword when initialValue changes
  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (searchKeyword) => {
    if (!searchKeyword || searchKeyword.trim().length < 2) {
      setSuggestions({ routes: [], attractions: [] });
      return;
    }

    setIsLoading(true);
    try {
      const response = await customerTourService.getSearchSuggestions(searchKeyword, 5);
      // Handle response structure: { success: true, data: { routes: [], attractions: [] } }
      if (response && response.data) {
        setSuggestions({
          routes: response.data.routes || [],
          attractions: response.data.attractions || []
        });
      } else if (response && response.routes) {
        // Direct response
        setSuggestions({
          routes: response.routes || [],
          attractions: response.attractions || []
        });
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({ routes: [], attractions: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounce (300ms)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setShowSuggestions(true);
  };

  // Handle search submit
  const handleSearch = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(keyword);
    } else {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  // Handle suggestion click - Route
  const handleRouteSuggestionClick = (route) => {
    setKeyword(route.name);
    setShowSuggestions(false);
    navigate(`/routes/${route.id}`);
  };

  // Handle suggestion click - Attraction (search by attraction)
  const handleAttractionSuggestionClick = (attraction) => {
    setKeyword(attraction.name);
    setShowSuggestions(false);
    navigate(`/search?keyword=${encodeURIComponent(attraction.name)}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasSuggestions = suggestions.routes.length > 0 || suggestions.attractions.length > 0;

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder={placeholder}
            value={keyword}
            onChange={handleInputChange}
            onFocus={() => keyword.length >= 2 && setShowSuggestions(true)}
            className="search-input"
          />
          {isLoading && <div className="search-loading-spinner"></div>}
        </div>
        <button type="submit" className="search-button">
          SEARCH
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && hasSuggestions && (
        <div className="suggestions-dropdown">
          {/* Routes Section */}
          {suggestions.routes.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-section-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Tours</span>
              </div>
              {suggestions.routes.map((route) => (
                <div
                  key={route.id}
                  className="suggestion-item route-suggestion"
                  onClick={() => handleRouteSuggestionClick(route)}
                >
                  <div className="suggestion-image">
                    {route.image ? (
                      <img src={route.image} alt={route.name} />
                    ) : (
                      <div className="suggestion-image-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{route.name}</div>
                    <div className="suggestion-meta">
                      <span>{route.startLocation} → {route.endLocation}</span>
                      {route.durationDays && <span> • {route.durationDays} days</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attractions Section */}
          {suggestions.attractions.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-section-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Attractions</span>
              </div>
              {suggestions.attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="suggestion-item attraction-suggestion"
                  onClick={() => handleAttractionSuggestionClick(attraction)}
                >
                  <div className="suggestion-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#4D40CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="#4D40CA" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{attraction.name}</div>
                    <div className="suggestion-meta">
                      {attraction.location}
                      {attraction.categoryName && <span> • {attraction.categoryName}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
