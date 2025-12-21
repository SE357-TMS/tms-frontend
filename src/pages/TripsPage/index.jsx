import React, { useEffect, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './TripsPage.css';
import viewIcon from '../../assets/icons/view.svg';
import tripService from '../../services/tripService';

// trips will be loaded from the backend

const TripsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setTitle('All Trips');
    setSubtitle('Information on all trips');
  }, [setTitle, setSubtitle]);

  const filteredQuery = query; // keep variable name for clarity
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper functions for formatting
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
        return 'scheduled';
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

  // Pagination helper function
  const getPaginationNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page if not already included
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const params = { 
          page: currentPage, 
          pageSize: itemsPerPage 
        };
        if (statusFilter) params.status = statusFilter;
        // Backend doesn't have keyword search in TripFilterRequest, we'll filter client-side for now

        const response = await tripService.getTrips(params);
        const payload = response.data?.data || {};
        let items = payload.items || payload.content || [];
        let total = payload.totalElements || payload.total || items.length;
        
        // Client-side filtering by route name if search query exists
        if (filteredQuery) {
          items = items.filter(trip => 
            trip.routeName?.toLowerCase().includes(filteredQuery.toLowerCase()) ||
            trip.startLocation?.toLowerCase().includes(filteredQuery.toLowerCase()) ||
            trip.endLocation?.toLowerCase().includes(filteredQuery.toLowerCase())
          );
          total = items.length; // Update total after filtering
        }
        
        setTrips(items);
        setTotalItems(total);
        setError(null);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Unable to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [filteredQuery, statusFilter, currentPage, itemsPerPage]);

  return (
    <div className="trips-page">
      <div className="trips-row-1">
        <div className="trips-filters">
          <div className="trips-search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by customer, email, tour..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="trips-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="FINISHED">Finished</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>

        <button
          className="btn-add-booking"
          onClick={() => navigate('/trips/new')}
        >
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path
              d="M12.25 7.25V17.25M7.25 12.25H17.25M7 23.5H17.5C19.6002 23.5 20.6503 23.5 21.4525 23.0913C22.1581 22.7317 22.7317 22.1581 23.0913 21.4525C23.5 20.6503 23.5 19.6002 23.5 17.5V7C23.5 4.8998 23.5 3.8497 23.0913 3.04754C22.7317 2.34193 22.1581 1.76825 21.4525 1.40873C20.6503 1 19.6002 1 17.5 1H7C4.8998 1 3.8497 1 3.04754 1.40873C2.34193 1.76825 1.76825 2.34193 1.40873 3.04754C1 3.8497 1 4.8998 1 7V17.5C1 19.6002 1 20.6503 1.40873 21.4525C1.76825 22.1581 2.34193 22.7317 3.04754 23.0913C3.8497 23.5 4.8998 23.5 7 23.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add new Trip
        </button>
      </div>

      <div className="trips-table-wrapper">
        <div className="trips-table-container">
          <table className="trips-table">
            <thead>
              <tr>
                <th>Tripname</th>
                <th>Departure date</th>
                <th>Pick-up location</th>
                <th style={{textAlign:'center'}}>Status</th>
                <th style={{textAlign:'center'}}>Price</th>
                <th style={{textAlign:'center'}}>Booked</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-loading">
                    <div className="spinner"></div> Loading trips...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="table-error">{error}</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">No trips found</td>
                </tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id}>
                    <td>
                      <div className="trip-info">
                        <div className="trip-name">{trip.routeName || 'N/A'}</div>
                        <div className="trip-sub">{trip.startLocation && trip.endLocation ? `${trip.startLocation} → ${trip.endLocation}` : 'Route info'}</div>
                      </div>
                    </td>
                    <td className="trip-departure">{formatDate(trip.departureDate)}</td>
                    <td className="trip-pickup">{trip.pickUpLocation || 'N/A'}</td>
                    <td style={{textAlign:'center'}}>
                      <span className={`status-badge ${getStatusClass(trip.status)}`}>{getStatusText(trip.status)}</span>
                    </td>
                    <td className="trip-price" style={{textAlign:'center'}}>{formatPrice(trip.price)}</td>
                    <td className="trip-booked">{trip.bookedSeats || 0}/{trip.totalSeats || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          title="View"
                        >
                          <img src={viewIcon} alt="View" />
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/trips/${trip.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12.75 3L15 5.25L4.5 15.75L1.5 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className="btn-cancel-booking"
                          onClick={() => alert(`Delete ${trip.id}`)}
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
              )}
            </tbody>
          </table>
        </div>

        <div className="trips-pagination-wrapper">
          <div className="pagination-info">
            <span>Show</span>
            <select 
              className="page-size-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
          
          <div className="pagination-info">
            <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries</span>
          </div>
          
          <div className="trips-pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {getPaginationNumbers(currentPage, totalPages).map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-btn" style={{cursor: 'default', border: 'none'}}>...</span>
              ) : (
                <button
                  key={pageNum}
                  className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            ))}
            
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
