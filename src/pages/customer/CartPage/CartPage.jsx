import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import cartService from "../../../services/cartService";
import bookingService from "../../../services/bookingService";
import CustomerSidebar from "../../../components/customer/CustomerSidebar";
import Swal from "sweetalert2";
import "./CartPage.css";

// Import icons
import QRCodeIcon from "../../../assets/icons/qrcode02.svg";
import MarkerPinIcon from "../../../assets/icons/markerpin.svg";
import AlarmClockIcon from "../../../assets/icons/alarmclock.svg";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import AddPersonIcon from "../../../assets/icons/addperson.svg";
import CloseIcon from "../../../assets/icons/close.svg";

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
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [creatingBookingItem, setCreatingBookingItem] = useState(null);
  const [confirmingBookings, setConfirmingBookings] = useState(false);

  // Fetch cart data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      const cartData = response?.data?.data;
      if (cartData?.items) {
        setCartItems(cartData.items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Swal.fire("Error", "Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for selected items
  const selectedTotal = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cartItems, selectedItems]);

  const selectedCount = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems, selectedItems]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = cartItems.filter(item => !item.isExpired).map((item) => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle individual item selection
  const handleSelectItem = (itemId, checked) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Handle quantity change
  const handleQuantityChange = async (item, delta) => {
    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Remove Item?",
        text: "Do you want to remove this item from your cart?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4D40CA",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await handleRemoveItem(item.id);
      }
      return;
    }

    if (newQuantity > item.availableSeats) {
      Swal.fire("Warning", `Only ${item.availableSeats} seats available`, "warning");
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(item.id));
      await cartService.updateCartItem(item.id, newQuantity);
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: newQuantity, subtotal: i.unitPrice * newQuantity }
            : i
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Swal.fire("Error", "Failed to update quantity", "error");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      Swal.fire({
        title: "Removed!",
        text: "Item has been removed from your cart",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      Swal.fire("Error", "Failed to remove item", "error");
    }
  };

  // Handle remove item with confirmation
  const handleRemoveItemClick = async (item) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: `Do you want to remove "${item.routeName}" from your cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4D40CA",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await handleRemoveItem(item.id);
    }
  };

  // Handle delete selected items
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      Swal.fire("Warning", "Please select items to delete", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Selected Items?",
      text: `Are you sure you want to delete ${selectedItems.size} selected item(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4D40CA",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const itemIds = Array.from(selectedItems);
        await cartService.removeMultipleFromCart(itemIds);
        setCartItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        Swal.fire({
          title: "Deleted!",
          text: "Selected items have been removed",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting items:", error);
        Swal.fire("Error", "Failed to delete items", "error");
      }
    }
  };

  // Handle book now
  const handleBookNow = async () => {
    if (selectedItems.size === 0) {
      Swal.fire("Warning", "Please select items to book", "warning");
      return;
    }

    const selected = cartItems.filter((item) => selectedItems.has(item.id) && !item.isExpired);

    if (selected.length === 0) {
      Swal.fire("Warning", "No valid cart items selected", "warning");
      return;
    }

    const missingPassengerInfo = selected.filter((item) => !item.pendingBookingId);
    if (missingPassengerInfo.length > 0) {
      const label = missingPassengerInfo
        .map((item) => item.routeName || item.routeCode || "Selected trip")
        .join(", ");
      Swal.fire(
        "Complete passenger information",
        `Please enter passenger details for ${label} before booking.`,
        "warning"
      );
      return;
    }

    setConfirmingBookings(true);
    try {
      const bookingResponses = await Promise.all(
        selected.map((item) => bookingService.getBookingById(item.pendingBookingId))
      );
      const bookingEntries = selected.map((item, index) => ({
        item,
        booking: bookingResponses[index]?.data?.data,
      }));

      const incompleteEntries = bookingEntries.filter(({ item, booking }) => {
        const travelerCount = booking?.travelers?.length ?? 0;
        return travelerCount < item.quantity;
      });

      if (incompleteEntries.length > 0) {
        const { item, booking } = incompleteEntries[0];
        const travelerCount = booking?.travelers?.length ?? 0;
        const missing = Math.max(0, item.quantity - travelerCount);
        const label = item.routeName || item.routeCode || "selected trip";
        Swal.fire(
          "Incomplete passenger information",
          `Please add ${missing} more passenger(s) for ${label} before confirming.`,
          "warning"
        );
        return;
      }

      for (const entry of bookingEntries) {
        const booking = entry.booking;
        if (!booking?.id) continue;
        await bookingService.confirmBooking(booking.id);
      }

      Swal.fire({
        title: "Success",
        text: "Bookings confirmed for all selected items",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setSelectedItems(new Set());
      navigate("/reservations");
    } catch (error) {
      console.error("Error confirming bookings:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to confirm bookings";
      Swal.fire("Error", message, "error");
    } finally {
      setConfirmingBookings(false);
    }
  };

  // Handle card click (navigate to route detail)
  const handleCardClick = (item, event) => {
    // Don't navigate if clicking on checkbox, remove button, or quantity controls
    if (
      event.target.closest(".item-checkbox") ||
      event.target.closest(".btn-remove") ||
      event.target.closest(".qty-buttons") ||
      event.target.closest(".btn-passenger")
    ) {
      return;
    }

    // Check if route is still open
    if (item.routeStatus === "OPEN") {
      navigate(`/routes/${item.routeId}`);
    } else {
      Swal.fire({
        title: "Route Unavailable",
        text: "This route is no longer available for booking",
        icon: "info",
        confirmButtonColor: "#4D40CA",
      });
    }
  };

  // Handle passenger info
  const handlePassengerInfo = async (item) => {
    if (!item || creatingBookingItem) return;

    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to continue",
        icon: "warning",
        confirmButtonColor: "#4D40CA",
      });
      return;
    }

    if (item.pendingBookingId) {
      navigate(`/passengers/${item.pendingBookingId}`, {
        state: {
          fromCart: true,
          cartItemId: item.id,
          cartQuantity: item.quantity,
          routeName: item.routeName,
        },
      });
      return;
    }

    try {
      setCreatingBookingItem(item.id);
      const payload = {
        tripId: item.tripId,
        quantity: item.quantity,
        cartItemId: item.id,
      };

      const response = await bookingService.createBooking(payload);
      const bookingData = response?.data?.data;

      if (!bookingData?.id) {
        throw new Error("Unable to create booking");
      }

      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                pendingBookingId: bookingData.id,
                pendingBookingStatus: bookingData.status || "PENDING",
              }
            : cartItem
        )
      );

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });

      navigate(`/passengers/${bookingData.id}`, {
        state: {
          fromCart: true,
          cartItemId: item.id,
          cartQuantity: item.quantity,
          routeName: item.routeName,
        },
      });
    } catch (error) {
      console.error("Error creating booking from cart:", error);
      const message = error?.response?.data?.message || error.message || "Failed to prepare booking";
      Swal.fire("Error", message, "error");
    } finally {
      setCreatingBookingItem(null);
    }
  };

  // Check if all non-expired items are selected
  const allSelected = useMemo(() => {
    const nonExpiredItems = cartItems.filter(item => !item.isExpired);
    return nonExpiredItems.length > 0 && nonExpiredItems.every((item) => selectedItems.has(item.id));
  }, [cartItems, selectedItems]);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">YOUR CART INFORMATION</h1>
          <div className="loading-state">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">YOUR CART INFORMATION</h1>

        <div className="cart-layout">
          {/* Left Sidebar */}
          <CustomerSidebar activeTab="cart" />

          {/* Right Content */}
          <section className="cart-content">
            {/* Control Bar */}
            <div className="cart-control-bar">
              <div className="left-controls">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text select-all">Select all</span>
                </label>
                <button className="btn-delete" onClick={handleDeleteSelected}>
                  Delete selected items
                </button>
              </div>
              <div className="right-summary">
                <span className="total-text">
                  Total ({selectedCount} products){" "}
                  <strong className="total-price">{formatPrice(selectedTotal)} ₫</strong>
                </span>
                <button
                  className="btn-book-now-small"
                  onClick={handleBookNow}
                  disabled={selectedItems.size === 0 || confirmingBookings}
                >
                  {confirmingBookings ? "Processing..." : "Book now"}
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button
                  className="btn-browse"
                  onClick={() => navigate("/search")}
                >
                  Browse Tours
                </button>
              </div>
            ) : (
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <article
                    key={item.id}
                    className={`cart-item ${item.isExpired ? "expired" : ""}`}
                    onClick={(e) => handleCardClick(item, e)}
                  >
                    <div className="item-checkbox">
                      <label className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          disabled={item.isExpired}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <div className="item-image">
                      <img
                        src={item.routeImage || "https://via.placeholder.com/280x160"}
                        alt={item.routeName}
                      />
                      {item.isExpired && (
                        <div className="expired-overlay">
                          <span>EXPIRED</span>
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-header">
                        <h3 className="tour-name">{item.routeName}</h3>
                        <button
                          className="btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItemClick(item);
                          }}
                        >
                          <img src={CloseIcon} alt="Remove" />
                        </button>
                      </div>

                      <div className="tour-specs">
                        <div className="spec-row">
                          <span className="spec">
                            <img src={QRCodeIcon} alt="Code" className="spec-icon" />
                            Tour code: <strong>{item.routeCode || "N/A"}</strong>
                          </span>
                          <span className="spec">
                            <img src={MarkerPinIcon} alt="Departure" className="spec-icon" />
                            Departure: <strong>{item.startLocation}</strong>
                          </span>
                        </div>
                        <div className="spec-row">
                          <span className="spec">
                            <img src={AlarmClockIcon} alt="Duration" className="spec-icon" />
                            Duration: <strong>{item.durationDays}N{item.durationDays - 1}Đ</strong>
                          </span>
                          <span className="spec">
                            <img src={MarkerPinIcon} alt="Destination" className="spec-icon" />
                            Destination: <strong>{item.endLocation}</strong>
                          </span>
                        </div>
                        <div className="spec-row passenger-row">
                          <span className="spec">
                            <img src={CalendarIcon} alt="Date" className="spec-icon" />
                            Departure date: {" "}
                            <span className="date-badge">
                              {formatDate(item.departureDate)}
                            </span>
                          </span>
                          <div className="passenger-actions">
                            <button
                              className="btn-passenger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePassengerInfo(item);
                              }}
                              disabled={item.isExpired || creatingBookingItem === item.id}
                            >
                              <img src={AddPersonIcon} alt="Passenger" />
                              {creatingBookingItem === item.id
                                ? "Preparing booking..."
                                : item.pendingBookingId
                                  ? "Continue passenger information"
                                  : "Enter passenger information"}
                            </button>
                            {item.pendingBookingId && (
                              <span className="booking-status">
                                Temporary booking {item.pendingBookingStatus?.toLowerCase() || "pending"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="item-footer">
                        <div className="quantity-wrapper">
                          <span className="qty-label">Quantity:</span>
                          <div className="qty-control">
                            <span>Person</span>
                            <div className="qty-buttons">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, -1);
                                }}
                                disabled={updatingItems.has(item.id) || item.isExpired}
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, 1);
                                }}
                                disabled={
                                  updatingItems.has(item.id) ||
                                  item.quantity >= item.availableSeats ||
                                  item.isExpired
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="item-total">
                          <span className="total-label">Total amount:</span>
                          <span className="total-value">
                            {formatPrice(item.subtotal)} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
