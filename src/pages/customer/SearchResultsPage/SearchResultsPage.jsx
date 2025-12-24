import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchGet } from "../../../lib/httpHandler";
import "./SearchResultsPage.css";

// Import icons
import HeartIcon from "../../../assets/icons/heart.svg";
import QRCodeIcon from "../../../assets/icons/qrcode02.svg";
import MarkerPinIcon from "../../../assets/icons/markerpin.svg";
import AlarmClockIcon from "../../../assets/icons/alarmclock.svg";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import LeftArrow from "../../../assets/icons/left.svg";
import RightArrow from "../../../assets/icons/right.svg";

// Budget options
const BUDGET_OPTIONS = [
  { label: "Under 5M", value: "under5", min: 0, max: 5000000 },
  { label: "5M - 10M", value: "5to10", min: 5000000, max: 10000000 },
  { label: "10M - 50M", value: "10to50", min: 10000000, max: 50000000 },
  { label: "Over 50M", value: "over50", min: 50000000, max: null },
];

// Sort options (search API doesn't have favoriteCount)
const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
  { label: "Nearest Departure", value: "dateAsc" },
];

// Duration options
const DURATION_OPTIONS = [
  { label: "All", value: "" },
  { label: "2N1Đ", value: 2 },
  { label: "3N2Đ", value: 3 },
  { label: "4N3Đ", value: 4 },
  { label: "5N4Đ", value: 5 },
  { label: "6N5Đ", value: 6 },
  { label: "7N6Đ+", value: 7 },
];

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const DEFAULT_FILTERS = {
  keyword: "",
  startLocation: "",
  destination: "",
  departureDate: "",
  durationDays: "",
  minPrice: "",
  maxPrice: "",
  attractionId: "",
  sortBy: "price",
  sortOrder: "asc",
};

// Helper functions
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getMinDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split("T")[0];
};

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const buildFiltersFromParams = () => ({
    ...DEFAULT_FILTERS,
    keyword: searchParams.get("keyword") || "",
    startLocation: searchParams.get("startLocation") || "",
    destination: searchParams.get("destination") || "",
    departureDate: searchParams.get("departureDate") || "",
    durationDays: searchParams.get("durationDays") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    attractionId: searchParams.get("attractionId") || "",
    sortBy: searchParams.get("sortBy") || "price",
    sortOrder: searchParams.get("sortOrder") || "asc",
  });
  const lastSetParamsRef = useRef(searchParams.toString());

  // Filter state
  const [filters, setFilters] = useState(() => buildFiltersFromParams());
  const [selectedBudget, setSelectedBudget] = useState("");

  // Data state
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Tour date indexes for slider
  const [tourDateIndexes, setTourDateIndexes] = useState({});

  // Get unique locations from tours
  const startLocations = useMemo(
    () => [...new Set(allTours.map(t => t.startLocation).filter(Boolean))],
    [allTours]
  );
  
  const destinations = useMemo(
    () => [...new Set(allTours.map(t => t.endLocation).filter(Boolean))],
    [allTours]
  );

  useEffect(() => {
    const newFilters = buildFiltersFromParams();
    setFilters(newFilters);
    
    const fetchTours = async () => {
      setLoading(true);

      const cleanFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([, value]) => value !== '' && value !== null)
      );

      const queryParams = new URLSearchParams(cleanFilters);
      const endpoint = `/api/v1/customer/tours/search?${queryParams.toString()}`;

      fetchGet(
        endpoint,
        (response) => {
          const tours =
            Array.isArray(response)
              ? response
              : Array.isArray(response?.items)
              ? response.items
              : Array.isArray(response?.data?.items)
              ? response.data.items
              : Array.isArray(response?.data?.tours)
              ? response.data.tours
              : Array.isArray(response?.data)
              ? response?.data
              : [];
          setAllTours(tours);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching tours:", error);
          setAllTours([]);
          setLoading(false);
        }
      );
    };

    fetchTours();
  }, [searchParams]);

  // The backend now handles filtering and sorting, so we just use the results directly.
  const filteredAndSortedTours = allTours;

  // Paginate filtered tours
  const paginatedTours = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredAndSortedTours.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedTours, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTours.length / pageSize));

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.startLocation) params.set("startLocation", filters.startLocation);
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.departureDate) params.set("departureDate", filters.departureDate);
    if (filters.durationDays) params.set("durationDays", filters.durationDays);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.attractionId) params.set("attractionId", filters.attractionId);
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);

    const serialized = params.toString();
    lastSetParamsRef.current = serialized;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Handle budget button click
  const handleBudgetClick = (budget) => {
    if (selectedBudget === budget.value) {
      setSelectedBudget("");
      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
    } else {
      setSelectedBudget(budget.value);
      setFilters((prev) => ({
        ...prev,
        minPrice: budget.min || "",
        maxPrice: budget.max || "",
      }));
    }
    setCurrentPage(0);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    let sortBy = "price";
    let sortOrder = "asc";

    switch (value) {
      case "priceAsc":
        sortBy = "price";
        sortOrder = "asc";
        break;
      case "priceDesc":
        sortBy = "price";
        sortOrder = "desc";
        break;
      case "dateAsc":
        sortBy = "departureDate";
        sortOrder = "asc";
        break;
      default:
        sortBy = "price";
        sortOrder = "asc";
    }

    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  // Handle tour card click
  const handleTourClick = (routeId) => {
    navigate(`/routes/${routeId}`);
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

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="search-results-page">
      <div className="main-layout">
        {/* Sidebar Filter */}
        <aside className="sidebar">
          <h2 className="sidebar-title">SEARCH FILTER</h2>

          {/* Budget */}
          <div className="filter-group">
            <label>Budget:</label>
            <div className="budget-grid">
              {BUDGET_OPTIONS.map((budget) => (
                <button
                  key={budget.value}
                  className={`budget-btn ${selectedBudget === budget.value ? "active" : ""}`}
                  onClick={() => handleBudgetClick(budget)}
                >
                  {budget.label}
                </button>
              ))}
            </div>
          </div>

          {/* Departure Point */}
          <div className="filter-group">
            <label>Departure point:</label>
            <div className="select-wrapper">
              <select
                value={filters.startLocation}
                onChange={(e) => handleFilterChange("startLocation", e.target.value)}
              >
                <option value="">All</option>
                {startLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <svg className="select-arrow" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Destination */}
          <div className="filter-group">
            <label>Destination:</label>
            <div className="select-wrapper">
              <select
                value={filters.destination}
                onChange={(e) => handleFilterChange("destination", e.target.value)}
              >
                <option value="">All</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
              <svg className="select-arrow" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Departure Date */}
          <div className="filter-group">
            <label>Departure date:</label>
            <div className="input-date-wrapper">
              <input
                type="date"
                value={filters.departureDate}
                onChange={(e) => handleFilterChange("departureDate", e.target.value)}
                min={getMinDate()}
              />
              <img src={CalendarIcon} alt="Calendar" className="calendar-icon" />
            </div>
          </div>

          {/* Duration */}
          <div className="filter-group">
            <label>Time:</label>
            <div className="select-wrapper">
              <select
                value={filters.durationDays}
                onChange={(e) => handleFilterChange("durationDays", e.target.value)}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg className="select-arrow" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="results-area">
          <div className="results-area-wrapper">
            <h1 className="page-title">INFORMATION OF SUITABLE TOURS</h1>

            <div className="results-header">
              <span className="results-count">
                {filteredAndSortedTours.length} matching results were found
              </span>
              <div className="sort-wrapper">
                <span>Sort by:</span>
                <div className="select-wrapper small">
                  <select onChange={handleSortChange}>
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredAndSortedTours.length > 0 && (
              <div className="search-pagination-info">
                <div className="page-size-selector">
                  <span>Show</span>
                  <select value={pageSize} onChange={handlePageSizeChange}>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>tours per page</span>
                </div>
                <div className="results-info">
                  Showing {currentPage * pageSize + 1} -{" "}
                  {Math.min((currentPage + 1) * pageSize, filteredAndSortedTours.length)} of {filteredAndSortedTours.length} tours
                </div>
              </div>
            )}

          {/* Tour List */}
          {loading ? (
            <div className="loading-state">Loading tours...</div>
          ) : paginatedTours.length === 0 ? (
            <div className="empty-state">No tours found matching your criteria.</div>
          ) : (
            <div className="tour-list">
              {paginatedTours.map((tour) => {
                const dateIndex = tourDateIndexes[tour.routeId] || 0;
                const trips = tour.upcomingTrips || [];
                const visibleTrips = trips.slice(dateIndex, dateIndex + 5);
                const maxDateIndex = Math.max(0, trips.length - 5);

                return (
                  <article
                    key={tour.routeId}
                    className="tour-card"
                    onClick={() => handleTourClick(tour.routeId)}
                  >
                    <div className="tour-img">
                      <img
                        src={tour.image || "https://via.placeholder.com/350x260"}
                        alt={tour.routeName}
                      />
                      <div className="wishlist-icon">
                        <img src={HeartIcon} alt="Favorite" />
                      </div>
                    </div>
                    <div className="tour-content">
                      <h3 className="tour-title">{tour.routeName}</h3>

                      <div className="tour-info-grid">
                        <div className="info-item">
                          <img src={QRCodeIcon} alt="Code" className="info-icon" />
                          <span>
                            Tour code: <strong>{tour.routeCode || "N/A"}</strong>
                          </span>
                        </div>
                        <div className="info-item">
                          <img src={MarkerPinIcon} alt="Departure" className="info-icon" />
                          <span>
                            Departure: <strong>{tour.startLocation}</strong>
                          </span>
                        </div>
                        <div className="info-item">
                          <img src={AlarmClockIcon} alt="Duration" className="info-icon" />
                          <span>
                            Time: <strong>{tour.durationDays}N{tour.durationDays - 1}Đ</strong>
                          </span>
                        </div>
                        <div className="info-item">
                          <img src={MarkerPinIcon} alt="Destination" className="info-icon" />
                          <span>
                            Destination: <strong>{tour.endLocation}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Departure Dates */}
                      {trips.length > 0 && (
                        <div className="tour-calendar">
                          <div className="cal-label">
                            <img src={CalendarIcon} alt="Calendar" />
                            <span>Departure date:</span>
                          </div>
                          <div className="cal-dates">
                            <button
                              className="nav-date"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTourDateNav(tour.routeId, -1, maxDateIndex);
                              }}
                              disabled={dateIndex === 0}
                            >
                              <img src={LeftArrow} alt="Previous" />
                            </button>
                            {visibleTrips.map((trip) => (
                              <span key={trip.tripId} className="date-tag">
                                {formatDate(trip.startDate)}
                              </span>
                            ))}
                            <button
                              className="nav-date"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTourDateNav(tour.routeId, 1, maxDateIndex);
                              }}
                              disabled={dateIndex >= maxDateIndex}
                            >
                              <img src={RightArrow} alt="Next" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="tour-footer">
                        <div className="price-box">
                          <span className="price-label">Price from:</span>
                          <span className="price-value">
                            {formatPrice(tour.minPrice)} ₫
                          </span>
                        </div>
                        <button
                          className="btn-book"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTourClick(tour.routeId);
                          }}
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <img src={LeftArrow} alt="Previous" />
              </button>
              {getPaginationNumbers().map((page) => (
                <button
                  key={page}
                  className={`page-link ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page + 1}
                </button>
              ))}
              {totalPages > 5 && currentPage < totalPages - 3 && <span>...</span>}
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <img src={RightArrow} alt="Next" />
              </button>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
