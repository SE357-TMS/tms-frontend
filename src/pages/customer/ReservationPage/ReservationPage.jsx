import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import bookingService from "../../../services/bookingService";
import CustomerSidebar from "../../../components/customer/CustomerSidebar";
import Swal from "sweetalert2";
import "./ReservationPage.css";

// Import icons
import QRCodeIcon from "../../../assets/icons/qrcode02.svg";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import LocationIcon from "../../../assets/icons/markerpin.svg";
import ClockIcon from "../../../assets/icons/alarmclock.svg";
import BookingIcon from "../../../assets/icons/booking.svg";

// Helper functions
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) + " " + date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getRouteDescription = (booking) => {
  if (booking.routeDescription) {
    return booking.routeDescription;
  }
  const { departureLocation, destination } = booking;
  if (departureLocation && destination) {
    return `${departureLocation} → ${destination}`;
  }
  if (departureLocation) {
    return departureLocation;
  }
  if (destination) {
    return destination;
  }
  return "";
};

export default function ReservationPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Fetch bookings
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings(statusFilter);
      const data = response?.data?.data;
      if (data) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Swal.fire("Error", "Failed to load reservations", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search
  // Hide temporary bookings (created from cart but not yet confirmed/ready for payment)
  // A temporary booking is a PENDING booking that:
  // - displayStatus is NOT 'PAYMENT' (not ready for payment)
  // - OR travelerCount < seatsBooked (travelers not fully added)
  const visibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Always show non-PENDING bookings (CONFIRMED, COMPLETED, CANCELED)
      if (b.bookingStatus !== "PENDING") return true;
      
      // For PENDING bookings, hide temporary ones:
      // - Must have displayStatus === 'PAYMENT' (ready for payment)
      // - Must have enough travelers (travelerCount >= seatsBooked)
      const hasEnoughTravelers = (b.travelerCount ?? 0) >= (b.seatsBooked ?? 1);
      const isReadyForPayment = b.displayStatus === "PAYMENT";
      
      return isReadyForPayment && hasEnoughTravelers;
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery) return visibleBookings;
    const query = searchQuery.toLowerCase();
    return visibleBookings.filter(
      (b) =>
        b.bookingCode?.toLowerCase().includes(query) ||
        b.routeCode?.toLowerCase().includes(query) ||
        b.routeName?.toLowerCase().includes(query)
    );
  }, [visibleBookings, searchQuery]);

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedBookings = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  // Handle payment click
  const handlePaymentClick = (booking) => {
    navigate(`/payment/${booking.id}`);
  };

  // Handle card click (view details)
  const handleCardClick = (booking, event) => {
    // Don't navigate if clicking on the button
    if (event.target.closest(".btn-status")) {
      return;
    }
    navigate(`/payment/${booking.id}`);
  };

  // Get status button config
  const getStatusConfig = (booking) => {
    const displayStatus = booking.displayStatus;
    
    switch (displayStatus) {
      case "PAID":
        return {
          text: "PAID",
          className: "paid",
          clickable: true,
        };
      case "CANCELLED":
        return {
          text: "CANCELLED",
          className: "cancelled",
          clickable: false,
        };
      case "REFUNDED":
        return {
          text: "REFUNDED",
          className: "cancelled",
          clickable: false,
        };
      case "PAYMENT_OVERDUE":
        return {
          text: "Payment Overdue",
          className: "overdue",
          clickable: false,
        };
      case "PAYMENT":
      default:
        return {
          text: "PAYMENT",
          className: "payment",
          clickable: true,
        };
    }
  };

  if (loading) {
    return (
      <div className="reservation-page">
        <div className="container">
          <h1 className="page-title">YOUR RESERVATION INFORMATION</h1>
          <div className="loading-state">Loading reservations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <div className="container">
        <h1 className="page-title">YOUR RESERVATION INFORMATION</h1>

        <div className="reservation-layout">
          {/* Left Sidebar */}
          <CustomerSidebar activeTab="bookings" />

          {/* Right Content */}
          <section className="reservation-content">
            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name/tour code, booking code ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="select-box">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <svg className="select-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Reservation List */}
            <div className="reservation-list">
              {paginatedBookings.length === 0 ? (
                <div className="empty-state">
                  <p>No reservations found</p>
                  <button className="btn-browse" onClick={() => navigate("/search")}>
                    Browse Tours
                  </button>
                </div>
              ) : (
                paginatedBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking);
                  const isDisabled = booking.disabled || booking.bookingStatus === "CANCELED";
                  const routeSubtitle = getRouteDescription(booking);
                  const travelerCount = booking.travelerCount ?? booking.seatsBooked;
                  const travelerLabel = travelerCount != null ? `${travelerCount} pax` : "-";
                  const infoItems = [
                    {
                      icon: QRCodeIcon,
                      label: "Booking Code",
                      value: booking.bookingCode || "-",
                    },
                    {
                      icon: CalendarIcon,
                      label: "Departure",
                      value: formatDateOnly(booking.departureDate),
                    },
                    {
                      icon: LocationIcon,
                      label: "Pick-up",
                      value: booking.pickUpLocation || "-",
                    },
                    {
                      icon: ClockIcon,
                      label: "Duration",
                      value: booking.durationDays ? `${booking.durationDays} days` : "-",
                    },
                    {
                      icon: BookingIcon,
                      label: "Travelers",
                      value: travelerLabel,
                    },
                    {
                      icon: CalendarIcon,
                      label: "Created",
                      value: formatDateTime(booking.createdAt) || "-",
                    },
                  ];
                  const visibleInfoItems = infoItems.filter((item) => {
                    const value = String(item.value ?? "").trim();
                    return value !== "-" && value !== "";
                  });

                  return (
                    <article
                      key={booking.id}
                      className={`res-card ${isDisabled ? "overlay-disabled" : ""}`}
                      onClick={(e) => handleCardClick(booking, e)}
                    >
                      <div className="res-img">
                        <img
                          src={booking.routeImage || "https://via.placeholder.com/280x112"}
                          alt={booking.routeName}
                        />
                      </div>

                      <div className="res-info">
                        <div className="res-info-top">
                          <div>
                            <h3 className="res-route-name">
                              {booking.routeName || booking.routeCode || "Tour"}
                            </h3>
                            {routeSubtitle && (
                              <p className="res-route-description">{routeSubtitle}</p>
                            )}
                          </div>
                          {booking.routeCode && (
                            <span className="res-route-code">{booking.routeCode}</span>
                          )}
                        </div>
                        <div className="res-specs">
                          {visibleInfoItems.map((item) => (
                            <div key={item.label} className="res-spec">
                              <img src={item.icon} alt={item.label} className="res-spec-icon" />
                              <span>
                                {item.label}: <strong>{item.value}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="res-action">
                        <span className="total-label">Total Amount:</span>
                        <span className={`total-price ${isDisabled ? "faded" : ""}`}>
                          {formatPrice(booking.totalPrice)} ₫
                        </span>
                        <button
                          className={`btn-status ${statusConfig.className}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (statusConfig.clickable) {
                              handlePaymentClick(booking);
                            }
                          }}
                          disabled={!statusConfig.clickable}
                        >
                          {statusConfig.text}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="reservation-pagination-wrapper">
                <div className="pagination-info">
                  <span>Show</span>
                  <select value={pageSize} onChange={handlePageSizeChange} className="page-size-select">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <span>results</span>
                  <span className="pagination-total">({totalItems} total)</span>
                </div>
                
                <div className="reservation-pagination">
                  <button 
                    onClick={() => goToPage(0)}
                    disabled={currentPage === 0 || totalPages === 0}
                    className="pagination-btn"
                  >
                    «
                  </button>
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0 || totalPages === 0}
                    className="pagination-btn"
                  >
                    ‹
                  </button>
                  
                  {totalPages > 0 ? (
                    [...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index;
                      } else if (currentPage < 3) {
                        pageNum = index;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })
                  ) : (
                    <button className="pagination-btn active">1</button>
                  )}
                  
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                    className="pagination-btn"
                  >
                    ›
                  </button>
                  <button 
                    onClick={() => goToPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                    className="pagination-btn"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
