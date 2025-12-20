import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import bookingService from "../../../services/bookingService";
import cartService from "../../../services/cartService";
import Swal from "sweetalert2";
import "./PassengerListPage.css";

// Import icons
import QRCodeIcon from "../../../assets/icons/qrcode02.svg";
import MarkerPinIcon from "../../../assets/icons/markerpin.svg";
import AlarmClockIcon from "../../../assets/icons/alarmclock.svg";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import AddPersonIcon from "../../../assets/icons/addperson.svg";
import CloseIcon from "../../../assets/icons/close.svg";
import EditIcon from "../../../assets/icons/modify.svg";
import DeleteIcon from "../../../assets/icons/close.svg";

// Helper functions
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateStr, format = "short") => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (format === "short") {
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  }
  if (format === "full") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatReturnDate = (departureDate, durationDays) => {
  if (!departureDate || !durationDays) return "";
  const date = new Date(departureDate);
  date.setDate(date.getDate() + durationDays - 1);
  return formatDate(date.toISOString(), "full");
};

const normalizePassengerValue = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const buildTravelerPayload = (traveler) => ({
  fullName: traveler.fullName,
  gender: traveler.gender || "M",
  dateOfBirth: normalizePassengerValue(traveler.dateOfBirth),
  identityDoc: normalizePassengerValue(traveler.identityDoc),
  email: normalizePassengerValue(traveler.email),
  phoneNumber: normalizePassengerValue(traveler.phoneNumber),
  address: normalizePassengerValue(traveler.address),
});

export default function PassengerListPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get data passed from navigation
  const navigationState = location.state || {};
  const isFromRouteDetail = navigationState.fromRouteDetail || false;
  const isFromCart = navigationState.fromCart || false;
  const tripData = navigationState.tripData || null;
  const cartRouteName = navigationState.routeName || "";
  const cartQuantity = navigationState.cartQuantity || null;
  const initialQuantity = navigationState.quantity || navigationState.cartQuantity || 1;

  // States
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [travelers, setTravelers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "M",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    address: "",
    identityDoc: "",
  });

  // Temp data for when coming from Route Detail (no booking yet)
  const [tempTripData, setTempTripData] = useState(tripData);

  // Fetch data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (bookingId && bookingId !== "new") {
      fetchBookingData();
    } else if (isFromRouteDetail && tripData) {
      // Coming from Route Detail, no booking yet
      setTempTripData(tripData);
      setLoading(false);
    } else {
      navigate("/cart");
    }
  }, [isAuthenticated, bookingId, navigate]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      const data = response?.data?.data;
      if (data) {
        setBooking(data);
        setQuantity(data.seatsBooked);
        setTravelers(data.travelers || []);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      Swal.fire("Error", "Failed to load booking data", "error");
      navigate("/reservations");
    } finally {
      setLoading(false);
    }
  };

  // Get display data (either from booking or temp trip data)
  const displayData = useMemo(() => {
    if (booking) {
      return {
        routeName: booking.routeName,
        routeCode: booking.routeCode,
        routeImage: booking.routeImage,
        departureLocation: booking.departureLocation,
        destination: booking.destination,
        durationDays: booking.durationDays,
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
        unitPrice: booking.unitPrice,
        availableSeats: 50, // From booking we don't have this easily
        tripId: booking.tripId,
      };
    } else if (tempTripData) {
      return {
        routeName: tempTripData.routeName,
        routeCode: tempTripData.routeCode,
        routeImage: tempTripData.routeImage,
        departureLocation: tempTripData.departureLocation,
        destination: tempTripData.destination,
        durationDays: tempTripData.durationDays,
        departureDate: tempTripData.departureDate,
        returnDate: tempTripData.returnDate,
        unitPrice: tempTripData.price,
        availableSeats: tempTripData.availableSeats,
        tripId: tempTripData.tripId,
      };
    }
    return null;
  }, [booking, tempTripData]);

  const totalPrice = useMemo(() => {
    if (displayData?.unitPrice) {
      return displayData.unitPrice * quantity;
    }
    return 0;
  }, [displayData, quantity]);

  // Quantity handlers
  const handleQuantityChange = async (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;

    // Check available seats
    if (delta > 0 && displayData?.availableSeats && newQuantity > displayData.availableSeats) {
      Swal.fire("Warning", `Only ${displayData.availableSeats} seats available`, "warning");
      return;
    }

    // Check if decreasing below current travelers count
    if (newQuantity < travelers.length) {
      Swal.fire("Warning", `Cannot reduce quantity below number of passengers (${travelers.length})`, "warning");
      return;
    }

    setQuantity(newQuantity);

    // If we have a booking, update on server
    if (booking) {
      try {
        await bookingService.updateQuantity(bookingId, newQuantity);
      } catch (error) {
        console.error("Error updating quantity:", error);
        setQuantity(quantity); // Revert
      }
    }
  };

  // Search filter
  const filteredTravelers = useMemo(() => {
    if (!searchQuery) return travelers;
    const query = searchQuery.toLowerCase();
    return travelers.filter(
      (t) =>
        t.fullName?.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        t.phoneNumber?.includes(query)
    );
  }, [travelers, searchQuery]);

  // Modal handlers
  const openAddModal = () => {
    setEditingTraveler(null);
    setFormData({
      fullName: "",
      gender: "M",
      dateOfBirth: "",
      email: "",
      phoneNumber: "",
      address: "",
      identityDoc: "",
    });
    setShowModal(true);
  };

  const openEditModal = (traveler) => {
    setEditingTraveler(traveler);
    setFormData({
      fullName: traveler.fullName || "",
      gender: traveler.gender || "M",
      dateOfBirth: traveler.dateOfBirth || "",
      email: traveler.email || "",
      phoneNumber: traveler.phoneNumber || "",
      address: traveler.address || "",
      identityDoc: traveler.identityDoc || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTraveler(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Swal.fire("Warning", "Full name is required", "warning");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire("Warning", "Invalid email address", "warning");
      return false;
    }
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      Swal.fire("Warning", "Invalid phone number", "warning");
      return false;
    }
    return true;
  };

  const handleSaveTraveler = async () => {
    if (!validateForm()) return;

    if (editingTraveler) {
      // Editing existing
      if (booking) {
        try {
          const response = await bookingService.updateTraveler(bookingId, editingTraveler.id, formData);
          const data = response?.data?.data;
          if (data) {
            setTravelers(data.travelers || []);
          }
        } catch (error) {
          console.error("Error updating traveler:", error);
          Swal.fire("Error", "Failed to update passenger", "error");
          return;
        }
      } else {
        // Temp update for when no booking yet
        setTravelers((prev) =>
          prev.map((t) => (t.tempId === editingTraveler.tempId ? { ...t, ...formData } : t))
        );
      }
    } else {
      // Adding new
      if (travelers.length >= quantity) {
        Swal.fire("Warning", "Cannot add more passengers than the booked quantity", "warning");
        return;
      }

      if (booking) {
        try {
          const response = await bookingService.addTravelers(bookingId, [formData]);
          const data = response?.data?.data;
          if (data) {
            setTravelers(data.travelers || []);
          }
        } catch (error) {
          console.error("Error adding traveler:", error);
          Swal.fire("Error", "Failed to add passenger", "error");
          return;
        }
      } else {
        // Temp add for when no booking yet
        setTravelers((prev) => [...prev, { ...formData, tempId: Date.now() }]);
      }
    }

    closeModal();
  };

  const handleDeleteTraveler = async (traveler) => {
    const result = await Swal.fire({
      title: "Delete Passenger?",
      text: `Are you sure you want to remove ${traveler.fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4D40CA",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      if (booking) {
        // For booking, we'd need a delete endpoint (not implemented in basic version)
        // For now, just show that deletion is not supported for confirmed bookings
        Swal.fire("Info", "Passenger deletion requires re-creating the booking", "info");
      } else {
        // Temp delete
        setTravelers((prev) => prev.filter((t) => t.tempId !== traveler.tempId));
      }
    }
  };

  // Book Now handler
  const handleBookNow = async () => {
    if (travelers.length < quantity) {
      const missing = quantity - travelers.length;
      const contextLabel = isFromCart ? "cart booking" : "selected trip";
      Swal.fire({
        title: "Incomplete Passenger Information",
        text: `Please add ${missing} more passenger(s) to match the ${contextLabel} quantity. Required: ${quantity}, Added: ${travelers.length}`,
        icon: "warning",
        confirmButtonColor: "#4D40CA",
      });
      return;
    }

    if (booking) {
      // Already have a booking, confirm it
      try {
        await bookingService.confirmBooking(bookingId);
        Swal.fire({
          title: "Success!",
          text: "Booking confirmed successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/reservations");
      } catch (error) {
        console.error("Error confirming booking:", error);
        Swal.fire("Error", error.response?.data?.message || "Failed to confirm booking", "error");
      }
    } else if (tempTripData) {
      // No booking yet (from Route Detail), create one
      try {
        const createData = {
          tripId: tempTripData.tripId,
          quantity: quantity,
          travelers: travelers.map(buildTravelerPayload),
        };

        const response = await bookingService.createBooking(createData);
        const data = response?.data?.data;

        // Now confirm the booking
        if (data?.id) {
          await bookingService.confirmBooking(data.id);
        }

        Swal.fire({
          title: "Success!",
          text: "Booking created and confirmed successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/reservations");
      } catch (error) {
        console.error("Error creating booking:", error);
        Swal.fire("Error", error.response?.data?.message || "Failed to create booking", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="passenger-page">
        <div className="container">
          <main className="passenger-main">
            <div className="loading-state">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="passenger-page">
        <div className="container">
          <main className="passenger-main">
            <div className="error-state">No booking data available</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="passenger-page">
      <div className="container">
        <main className="passenger-main">
          <div className="passenger-layout">
            {/* Left Sidebar - Booking Info */}
            <aside className="booking-sidebar">
              {/* Book Tickets Widget */}
              <div className="widget booking-box">
                <h2 className="widget-title">BOOK TICKETS</h2>

                <div className="form-group">
                  <label>Departure date:</label>
                  <div className="input-wrapper readonly">
                    <span>{formatDate(displayData.departureDate, "full")}</span>
                    <img src={CalendarIcon} alt="Calendar" className="input-icon" />
                  </div>
                </div>

                <div className="form-group price-row">
                  <label>Ticket price:</label>
                  <span className="price-single">{formatPrice(displayData.unitPrice)} ₫ / Guest</span>
                </div>

                <div className="form-group">
                  <label>Quantity:</label>
                  <div className="quantity-control">
                    <span>People</span>
                    <div className="counter">
                      <button className="btn-minus" onClick={() => handleQuantityChange(-1)}>
                        −
                      </button>
                      <span className="count">{quantity}</span>
                      <button className="btn-plus" onClick={() => handleQuantityChange(1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="total-row">
                  <label>Total amount:</label>
                  <span className="total-price">{formatPrice(totalPrice)} ₫</span>
                </div>

                <button className="btn-book-now" onClick={handleBookNow}>
                  Book now <span className="arrow">→</span>
                </button>
              </div>

              {/* Trip Info Widget */}
              <div className="widget trip-info-box">
                <h2 className="widget-title">TRIP INFORMATION</h2>
                <ul className="info-list">
                  <li>
                    <img src={MarkerPinIcon} alt="Departure" className="info-icon" />
                    <span>
                      Departure: <strong>{displayData.departureLocation}</strong>
                    </span>
                  </li>
                  <li>
                    <img src={MarkerPinIcon} alt="Destination" className="info-icon" />
                    <span>
                      Destination: <strong>{displayData.destination}</strong>
                    </span>
                  </li>
                  <li>
                    <img src={AlarmClockIcon} alt="Time" className="info-icon" />
                    <span>
                      Time: <strong>{displayData.durationDays}N{displayData.durationDays - 1}Đ</strong>
                    </span>
                  </li>
                  <li>
                    <img src={CalendarIcon} alt="End date" className="info-icon" />
                    <span>
                      End date: <strong>{formatReturnDate(displayData.departureDate, displayData.durationDays)}</strong>
                    </span>
                  </li>
                  <li>
                    <img src={AddPersonIcon} alt="Seats" className="info-icon" />
                    <span>
                      Number of seats available: <strong>{displayData.availableSeats || "N/A"}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Right Content - Passenger List */}
            <section className="passenger-content">
              <h1 className="section-headline">YOUR PASSENGER LIST INFORMATION</h1>

              <div className="action-bar">
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
                    placeholder="Searching ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn-add-passenger" onClick={openAddModal}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add passenger
                </button>
              </div>

              <div className="passenger-count-info">
                <span>
                  Passengers added: <strong>{travelers.length}</strong> / <strong>{quantity}</strong>
                </span>
                {travelers.length < quantity && (
                  <span className="warning-text">
                    (Need {quantity - travelers.length} more)
                  </span>
                )}
              </div>

              {isFromCart && (
                <div className="cart-origin-note">
                  <strong>Cart booking:</strong> This reservation was created from your cart entry
                  {cartRouteName ? ` for "${cartRouteName}"` : ""}. Complete the {quantity} passenger(s)
                  before confirming.
                </div>
              )}

              <div className="table-container">
                <table className="passenger-table">
                  <thead>
                    <tr>
                      <th className="col-no">No.</th>
                      <th className="col-name">Full Name</th>
                      <th className="col-gender">Gender</th>
                      <th className="col-dob">Date of Birth</th>
                      <th className="col-email">Email</th>
                      <th className="col-phone">Phone</th>
                      <th className="col-action">Edit</th>
                      <th className="col-action">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTravelers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-row">
                          No passengers added yet
                        </td>
                      </tr>
                    ) : (
                      filteredTravelers.map((traveler, index) => (
                        <tr key={traveler.id || traveler.tempId}>
                          <td>{index + 1}</td>
                          <td>{traveler.fullName}</td>
                          <td>{traveler.gender === "M" ? "Male" : traveler.gender === "F" ? "Female" : "Other"}</td>
                          <td>{traveler.dateOfBirth || "-"}</td>
                          <td>{traveler.email || "-"}</td>
                          <td>{traveler.phoneNumber || "-"}</td>
                          <td>
                            <button className="btn-icon edit" onClick={() => openEditModal(traveler)}>
                              <svg viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </td>
                          <td>
                            <button className="btn-icon delete" onClick={() => handleDeleteTraveler(traveler)}>
                              <svg viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M3 6H5H21"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tour Summary Card */}
              <div className="tour-summary-card">
                <div className="tour-img">
                  <img
                    src={displayData.routeImage || "https://via.placeholder.com/400x200"}
                    alt={displayData.routeName}
                  />
                </div>
                <div className="tour-details">
                  <h3 className="tour-name">{displayData.routeName}</h3>
                  <div className="tour-specs">
                    <div className="spec-col">
                      <span>
                        <img src={QRCodeIcon} alt="Code" className="spec-icon" />
                        Tour code: <strong>{displayData.routeCode}</strong>
                      </span>
                      <span>
                        <img src={AlarmClockIcon} alt="Duration" className="spec-icon" />
                        Duration: <strong>{displayData.durationDays}N{displayData.durationDays - 1}Đ</strong>
                      </span>
                      <span>
                        <img src={CalendarIcon} alt="Date" className="spec-icon" />
                        Departure date: <span className="badge">{formatDate(displayData.departureDate, "short")}</span>
                      </span>
                    </div>
                    <div className="spec-col">
                      <span>
                        <img src={MarkerPinIcon} alt="From" className="spec-icon" />
                        Departure: <strong>{displayData.departureLocation}</strong>
                      </span>
                      <span>
                        <img src={MarkerPinIcon} alt="To" className="spec-icon" />
                        Destination: <strong>{displayData.destination}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="tour-footer">
                    <div className="qty-display">
                      <span>Quantity:</span>
                      <div className="mini-counter">
                        <span>Person</span>
                        <div className="controls">
                          <button onClick={() => handleQuantityChange(-1)}>−</button>
                          <span>{quantity}</span>
                          <button onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                      </div>
                    </div>
                    <div className="price-display">
                      <span>Total amount:</span>
                      <strong className="price-val">{formatPrice(totalPrice)} ₫</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Add/Edit Passenger Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container passenger-modal">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2>{editingTraveler ? "Edit Passenger" : "Add New Passenger"}</h2>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <img src={CloseIcon} alt="Close" />
              </button>
            </div>

            <div className="modal-body">
              <form className="passenger-form">
                <div className="form-row">
                  <div className="form-item">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-item">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleFormChange}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-item">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-item">
                    <label>Identity Document (CCCD/Passport)</label>
                    <input
                      type="text"
                      name="identityDoc"
                      value={formData.identityDoc}
                      onChange={handleFormChange}
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-item">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-item">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-item full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Enter address"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveTraveler}>
                {editingTraveler ? "Update" : "Add Passenger"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
