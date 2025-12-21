import React, { useState, useEffect } from 'react';
import api from '../../lib/httpHandler';
import './ChooseRouteModal.css';

export default function ChooseRouteModal({ isOpen, onClose, onSelectRoute }) {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRoutes();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter routes based on search text
    if (searchText.trim() === '') {
      setFilteredRoutes(routes);
    } else {
      const search = searchText.toLowerCase();
      const filtered = routes.filter(route => 
        route.routeName?.toLowerCase().includes(search) ||
        route.startLocation?.toLowerCase().includes(search) ||
        route.endLocation?.toLowerCase().includes(search)
      );
      setFilteredRoutes(filtered);
    }
  }, [searchText, routes]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/routes');
      
      console.log('Routes API response:', response);
      
      // Handle various response formats
      let routeData = [];
      if (Array.isArray(response)) {
        routeData = response;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        routeData = response.data.items;
      } else if (Array.isArray(response?.data?.data?.items)) {
        routeData = response.data.data.items;
      } else if (Array.isArray(response?.data)) {
        routeData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        routeData = response.data.data;
      } else if (response?.items && Array.isArray(response.items)) {
        routeData = response.items;
      } else {
        console.warn('Unexpected route response format:', response);
        routeData = [];
      }
      
      console.log('Extracted route data:', routeData);
      
      setRoutes(routeData);
      setFilteredRoutes(routeData);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (route) => {
    setSelectedRoute(route);
  };

  const handleConfirm = () => {
    if (selectedRoute) {
      onSelectRoute(selectedRoute);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedRoute(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="choose-route-modal-overlay" onClick={handleCancel}>
      <div className="choose-route-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose Route</h2>
          <button className="close-btn" onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Search Box */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Nhập tên tuyến hoặc địa điểm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Route List */}
          <div className="route-list">
            {loading ? (
              <div className="loading-state">Loading routes...</div>
            ) : filteredRoutes.length === 0 ? (
              <div className="empty-state">No routes found</div>
            ) : (
              filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                  onClick={() => handleRouteClick(route)}
                >
                  <div className="route-image">
                    <img
                      src={route.image || 'https://via.placeholder.com/200x150?text=No+Image'}
                      alt={route.routeName}
                    />
                  </div>
                  <div className="route-info">
                    <h3 className="route-name">{route.routeName}</h3>
                    <div className="route-locations">
                      <span className="location start">{route.startLocation}</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="location end">{route.endLocation}</span>
                    </div>
                    <div className="route-details">
                      <span className="duration">{route.durationDays}N{route.durationDays - 1}Đ</span>
                      {route.description && (
                        <span className="description">{route.description}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleConfirm}
            disabled={!selectedRoute}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
