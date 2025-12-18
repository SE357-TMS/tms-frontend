import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import customerTourService from '../../../services/customerTourService';
import SearchBar from '../../../components/customer/SearchBar/SearchBar';
import TourCard from '../../../components/customer/TourCard/TourCard';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL
  const initialKeyword = searchParams.get('keyword') || '';
  
  // State
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    startLocation: '',
    destination: '',
    departureDate: '',
    durationDays: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'favoriteCount',
    sortOrder: 'desc'
  });
  
  // Start locations for dropdown
  const [startLocations, setStartLocations] = useState([]);
  
  // Fetch start locations
  useEffect(() => {
    const fetchStartLocations = async () => {
      try {
        const response = await customerTourService.getStartLocations();
        // Response structure: { success, message, data: string[] }
        if (response && response.data) {
          setStartLocations(response.data);
        }
      } catch (error) {
        console.error('Error fetching start locations:', error);
      }
    };
    fetchStartLocations();
  }, []);
  
  // Search tours
  const searchTours = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      
      const searchRequest = {
        keyword: filters.keyword || undefined,
        startLocation: filters.startLocation || undefined,
        destination: filters.destination || undefined,
        departureDate: filters.departureDate || undefined,
        durationDays: filters.durationDays ? parseInt(filters.durationDays) : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: page,
        size: pagination.size
      };
      
      const response = await customerTourService.searchTours(searchRequest);
      
      // Response structure: { success, message, data: Page<TourCardResponse> }
      if (response && response.data) {
        const pageData = response.data;
        setTours(pageData.content || []);
        setPagination({
          currentPage: pageData.number || 0,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          size: pageData.size || 10
        });
      }
    } catch (error) {
      console.error('Error searching tours:', error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.size]);
  
  // Initial search and when filters change
  useEffect(() => {
    searchTours(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.sortBy, filters.sortOrder]);
  
  // Update URL when keyword changes
  useEffect(() => {
    if (filters.keyword) {
      setSearchParams({ keyword: filters.keyword });
    } else {
      setSearchParams({});
    }
  }, [filters.keyword, setSearchParams]);
  
  const handleSearch = (keyword) => {
    setFilters(prev => ({ ...prev, keyword }));
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleApplyFilters = () => {
    searchTours(0);
  };
  
  const handleClearFilters = () => {
    setFilters({
      keyword: filters.keyword, // Keep keyword
      startLocation: '',
      destination: '',
      departureDate: '',
      durationDays: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'favoriteCount',
      sortOrder: 'desc'
    });
  };
  
  const handlePageChange = (page) => {
    searchTours(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortBy === prev.sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="search-results-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-header-container">
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={filters.keyword}
            placeholder="Tìm kiếm tour, địa điểm..."
          />
        </div>
      </div>
      
      <div className="search-content">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>Bộ lọc</h3>
            <button className="clear-btn" onClick={handleClearFilters}>
              Xóa bộ lọc
            </button>
          </div>
          
          {/* Start Location */}
          <div className="filter-group">
            <label>Điểm khởi hành</label>
            <select 
              value={filters.startLocation}
              onChange={(e) => handleFilterChange('startLocation', e.target.value)}
            >
              <option value="">Tất cả</option>
              {startLocations.map((location, idx) => (
                <option key={idx} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          {/* Destination */}
          <div className="filter-group">
            <label>Điểm đến</label>
            <input 
              type="text"
              placeholder="Nhập điểm đến..."
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
            />
          </div>
          
          {/* Departure Date */}
          <div className="filter-group">
            <label>Ngày khởi hành</label>
            <input 
              type="date"
              value={filters.departureDate}
              onChange={(e) => handleFilterChange('departureDate', e.target.value)}
            />
          </div>
          
          {/* Duration */}
          <div className="filter-group">
            <label>Số ngày</label>
            <select 
              value={filters.durationDays}
              onChange={(e) => handleFilterChange('durationDays', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="1">1 ngày</option>
              <option value="2">2 ngày</option>
              <option value="3">3 ngày</option>
              <option value="4">4 ngày</option>
              <option value="5">5 ngày</option>
              <option value="6">6 ngày</option>
              <option value="7">7 ngày</option>
            </select>
          </div>
          
          {/* Price Range */}
          <div className="filter-group">
            <label>Ngân sách</label>
            <div className="price-inputs">
              <input 
                type="number"
                placeholder="Từ"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <input 
                type="number"
                placeholder="Đến"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
          
          <button className="apply-filter-btn" onClick={handleApplyFilters}>
            Áp dụng bộ lọc
          </button>
        </aside>
        
        {/* Results */}
        <main className="results-main">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-count">
              {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${pagination.totalElements} tour`}
            </div>
            <div className="sort-options">
              <span>Sắp xếp:</span>
              <button 
                className={`sort-btn ${filters.sortBy === 'favoriteCount' ? 'active' : ''}`}
                onClick={() => handleSortChange('favoriteCount')}
              >
                Phổ biến {filters.sortBy === 'favoriteCount' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button 
                className={`sort-btn ${filters.sortBy === 'minPrice' ? 'active' : ''}`}
                onClick={() => handleSortChange('minPrice')}
              >
                Giá {filters.sortBy === 'minPrice' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button 
                className={`sort-btn ${filters.sortBy === 'durationDays' ? 'active' : ''}`}
                onClick={() => handleSortChange('durationDays')}
              >
                Thời gian {filters.sortBy === 'durationDays' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
          
          {/* Tour List */}
          {loading ? (
            <div className="loading-list">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-list-card"></div>
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Không tìm thấy tour phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
            </div>
          ) : (
            <div className="tour-list">
              {tours.map((tour) => (
                <TourCard key={tour.routeId} tour={tour} variant="list" />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                disabled={pagination.currentPage === 0}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                ‹
              </button>
              
              {[...Array(pagination.totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`page-btn ${pagination.currentPage === idx ? 'active' : ''}`}
                  onClick={() => handlePageChange(idx)}
                >
                  {idx + 1}
                </button>
              ))}
              
              <button 
                className="page-btn"
                disabled={pagination.currentPage === pagination.totalPages - 1}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;
