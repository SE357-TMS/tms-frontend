import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import bookingService from "../../../services/bookingService";
import paymentService from "../../../services/paymentService";
import Swal from "sweetalert2";
import "./PaymentPage.css";
import "./PaymentModal.css";

// Import icons
import QRCodeIcon from "../../../assets/icons/qrcode02.svg";
import QRCode from "react-qr-code";
import CalendarIcon from "../../../assets/icons/calendardate.svg";
import LocationIcon from "../../../assets/icons/markerpin.svg";
import ClockIcon from "../../../assets/icons/alarmclock.svg";
import RouteIcon from "../../../assets/icons/route.svg";
import PlaneIcon from "../../../assets/icons/plane.svg";
import CashIcon from "../../../assets/icons/cash.svg";
import BankTransferIcon from "../../../assets/icons/banktransfer.svg";
import EwalletIcon from "../../../assets/icons/ewallet.svg";

// Helper functions
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
};

const formatDateInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const formatTime = (timeStr) => {
  if (!timeStr) return "-";
  const normalized = timeStr.split(":").length === 2 ? `${timeStr}:00` : timeStr;
  const date = new Date(`1970-01-01T${normalized}`);
  if (Number.isNaN(date.getTime())) {
    return timeStr;
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // States
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [travelerForm, setTravelerForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketModalValue, setTicketModalValue] = useState(null);

  const contactInfo = paymentData?.contactInfo || {};
  const orderInfo = paymentData?.orderInfo || {};
  const invoiceInfo = orderInfo?.invoice || {};
  const passengers = orderInfo?.passengers || [];

  // Payment methods
  const paymentMethods = [
    { id: "CASH", label: "Cash", icon: CashIcon },
    { id: "BANK_TRANSFER", label: "Bank Transfer", icon: BankTransferIcon },
    { id: "E_WALLET", label: "E-Wallet", icon: EwalletIcon },
  ];

  const fetchPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingService.getPaymentPageData(bookingId);
      const data = response?.data?.data;
      if (data) {
        setPaymentData(data);
        setSelectedPaymentMethod(data.orderInfo?.invoice?.paymentMethod || "CASH");
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      Swal.fire("Error", "Failed to load payment information", "error");
      navigate("/reservations");
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  // Fetch payment data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (bookingId) {
      fetchPaymentData();
      // Check for stored payment URL
      const stored = paymentService.getStoredPaymentUrl(bookingId);
      if (stored && stored.checkoutUrl) {
        setPaymentLinkData(stored);
      }
    }
  }, [isAuthenticated, bookingId, navigate, fetchPaymentData]);

  // Cleanup on logout: cancel pending payments
  useEffect(() => {
    if (!isAuthenticated && bookingId) {
      const stored = paymentService.getStoredPaymentUrl(bookingId);
      if (stored && stored.orderCode) {
        // Cancel the payment link
        paymentService.cancelPaymentLink(stored.orderCode).catch(console.error);
        paymentService.clearStoredPaymentUrl(bookingId);
      }
    }
  }, [isAuthenticated, bookingId]);

  // Handle payment method change
  const handlePaymentMethodChange = async (method) => {
    setSelectedPaymentMethod(method);
    try {
      await bookingService.updatePaymentMethod(bookingId, method);
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  };

  // Handle edit traveler
  const handleEditTraveler = (traveler) => {
    setEditingTraveler(traveler);
    setTravelerForm({
      fullName: traveler.fullName || "",
      dateOfBirth: formatDateInput(traveler.dateOfBirth) || "",
      gender: traveler.gender || "MALE",
      email: traveler.email || "",
      phoneNumber: traveler.phoneNumber || "",
      address: traveler.address || "",
    });
    setShowEditModal(true);
  };

  // Handle traveler form change
  const handleTravelerFormChange = (field, value) => {
    setTravelerForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit traveler edit
  const submitTravelerEdit = async () => {
    if (!travelerForm.fullName.trim()) {
      Swal.fire("Warning", "Please enter traveler name", "warning");
      return;
    }

    try {
      await bookingService.updateTraveler(
        bookingId,
        editingTraveler.id,
        travelerForm
      );
      setShowEditModal(false);
      fetchPaymentData();
      Swal.fire("Success", "Traveler information updated", "success");
    } catch (error) {
      console.error("Error updating traveler:", error);
      Swal.fire("Error", "Failed to update traveler", "error");
    }
  };

  // Handle create payment link (for Bank Transfer / E-Wallet)
  const handleCreatePaymentLink = async () => {
    try {
      setPaymentLoading(true);
      const amount = Math.floor((orderInfo.totalPrice || 0) / 1000); // Divide by 1000 for demo
      
      const response = await paymentService.createPaymentLink({
        bookingId: bookingId,
        amount: amount,
        description: `DH${orderInfo.bookingCode || bookingId}`,
        buyerName: contactInfo.fullName || user?.fullName,
        buyerEmail: contactInfo.email || user?.email,
        buyerPhone: contactInfo.phoneNumber,
      });

      const data = response?.data?.data;
      if (data && data.checkoutUrl) {
        setPaymentLinkData(data);
        paymentService.storePaymentUrl(bookingId, data);
        setShowPaymentModal(true);
      } else {
        throw new Error("Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to create payment link",
        "error"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleViewTicket = (value) => {
    if (!value) return;
    setTicketModalValue(value);
    setShowTicketModal(true);
  };

  // Handle verify payment and confirm booking
  const refreshPaymentStatus = useCallback(
    async ({ orderCode, showNotification = false } = {}) => {
      if (!orderCode) return;

      try {
        const response = await paymentService.verifyAndUpdatePayment(
          bookingId,
          orderCode
        );
        const data = response?.data?.data;

        if (data) {
          setPaymentLinkData((prev) => ({ ...prev, ...data }));
          if (data.status === "PAID") {
            paymentService.clearStoredPaymentUrl(bookingId);
            await fetchPaymentData();
            if (showNotification) {
              Swal.fire("Success", "Payment verified successfully", "success");
            }
            setShowPaymentModal(false);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (showNotification) {
          Swal.fire(
            "Error",
            error.response?.data?.message || "Failed to verify payment",
            "error"
          );
        }
      }
    },
    [bookingId, fetchPaymentData]
  );

  useEffect(() => {
    if (!showPaymentModal) return;
    const currentOrderCode = paymentLinkData?.orderCode;
    if (!currentOrderCode) return;

    refreshPaymentStatus({ orderCode: currentOrderCode });
    const intervalId = setInterval(
      () => refreshPaymentStatus({ orderCode: currentOrderCode }),
      5000
    );

    return () => clearInterval(intervalId);
  }, [showPaymentModal, paymentLinkData?.orderCode, refreshPaymentStatus]);

  const handleClosePaymentModal = async () => {
    await refreshPaymentStatus({
      orderCode: paymentLinkData?.orderCode,
      showNotification: true,
    });
    setShowPaymentModal(false);
  };

  // Handle confirm payment (for CASH)
  const handleConfirmPayment = async () => {
    const result = await Swal.fire({
      title: "Confirm Payment",
      text: "Are you sure you want to confirm this booking?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await bookingService.confirmBooking(bookingId);
        Swal.fire("Success", "Booking confirmed successfully!", "success");
        navigate("/reservations");
      } catch (error) {
        console.error("Error confirming booking:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to confirm booking",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    const result = await Swal.fire({
      title: "Cancel Booking",
      text: "Are you sure you want to cancel this booking? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel Booking",
      cancelButtonText: "No, Keep It",
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await bookingService.cancelBooking(bookingId);
        Swal.fire("Cancelled", "Your booking has been cancelled", "success");
        navigate("/reservations");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to cancel booking",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isBeforeDepartureEditWindow = () => {
    if (!orderInfo?.departureDate) return false;
    const departureDate = new Date(orderInfo.departureDate);
    const editDeadline = new Date(departureDate.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < editDeadline;
  };

  // Check if booking can be modified (by status or time window)
  const canModify = () => {
    const status = invoiceInfo?.paymentStatus;
    const statusAllowed = status === "UNPAID" || status === "PENDING";
    return statusAllowed || isBeforeDepartureEditWindow();
  };

  // Check if booking is already paid
  const isPaid = () => {
    return invoiceInfo?.paymentStatus === "PAID";
  };

  // Check if booking is cancelled
  const isCancelled = () => {
    return (
      orderInfo?.bookingStatus === "CANCELED" ||
      invoiceInfo?.paymentStatus === "CANCELLED" ||
      invoiceInfo?.paymentStatus === "REFUNDED"
    );
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <h1 className="page-title">PAYMENT</h1>
          <div className="loading-state">Loading payment information...</div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="payment-page">
        <div className="container">
          <h1 className="page-title">PAYMENT</h1>
          <div className="error-state">
            <p>Payment information not found</p>
            <button onClick={() => navigate("/reservations")}>
              Back to Reservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const routeLabel =
    orderInfo.departureLocation && orderInfo.destination
      ? `${orderInfo.departureLocation} → ${orderInfo.destination}`
      : orderInfo.routeDescription || "-";

  const infoItems = [
    {
      icon: QRCodeIcon,
      label: "Route Code",
      value: orderInfo.routeCode || "-",
    },
    {
      icon: CalendarIcon,
      label: "Departure",
      value: formatDate(orderInfo.departureDate) || "-",
    },
    {
      icon: RouteIcon,
      label: "Route",
      value: routeLabel,
    },
    {
      icon: LocationIcon,
      label: "Pick-up",
      value: orderInfo.pickUpLocation || "-",
    },
    {
      icon: ClockIcon,
      label: "Duration",
      value: orderInfo.durationDays ? `${orderInfo.durationDays} days` : "-",
    },
    {
      icon: PlaneIcon,
      label: "Pick-up Time",
      value: formatTime(orderInfo.pickUpTime),
    },
  ];

  return (
    <div className="payment-page">
      <div className="container">
        <h1 className="page-title">PAYMENT</h1>

        <div className="payment-layout">
          {/* Left Column - Contact & Payment Method */}
          <div className="payment-left">
            {/* Contact Information */}
            <section className="contact-section">
              <h2 className="section-title">Contact Information</h2>
              <div className="contact-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={contactInfo.fullName || ""}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={contactInfo.email || ""}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={contactInfo.phoneNumber || ""}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={contactInfo.address || ""}
                    readOnly
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="payment-method-section">
              <h2 className="section-title">Payment Method</h2>
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option ${
                      selectedPaymentMethod === method.id ? "active" : ""
                    } ${!canModify() ? "disabled" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => handlePaymentMethodChange(method.id)}
                      disabled={!canModify()}
                    />
                    <img src={method.icon} alt={method.label} />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Order Details */}
          <div className="payment-right">
            <section className="order-section">
              <h2 className="section-title">Order Information</h2>

              {/* Tour Card */}
              <div className="tour-card">
                <div className="tour-image">
                  <img
                    src={
                      orderInfo.routeImage || "https://via.placeholder.com/400x200"
                    }
                    alt={orderInfo.routeName}
                  />
                </div>
                <div className="tour-details">
                  <div className="tour-header">
                    <div>
                      <h3 className="tour-route-name">
                        {orderInfo.routeName || orderInfo.routeCode || "Tour"}
                      </h3>
                      {(orderInfo.routeDescription || routeLabel) && (
                        <p className="tour-description">
                          {orderInfo.routeDescription || routeLabel}
                        </p>
                      )}
                    </div>
                    {orderInfo.bookingCode && (
                      <span className="tour-route-code">
                        {orderInfo.bookingCode}
                      </span>
                    )}
                  </div>
                  <div className="tour-info-grid">
                    {infoItems.map((item) => (
                      <span key={item.label} className="tour-info-item">
                        <img src={item.icon} alt={item.label} />
                        {item.label}: <strong>{item.value}</strong>
                      </span>
                    ))}
                  </div>
                  <div className="tour-price-row">
                    <span className="quantity">
                      Quantity: {orderInfo.passengerCount || 0}
                    </span>
                    <span className="price">
                      {formatPrice(orderInfo.totalPrice)} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Passenger List */}
              <div className="passenger-section">
                <h3 className="passenger-title">Passenger List</h3>
                <div className="passenger-table-wrapper">
                  <table className="passenger-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Full Name</th>
                        <th>Date of Birth</th>
                        <th>Gender</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Ticket QR</th>
                        {canModify() && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {passengers.length > 0 ? (
                        passengers.map((traveler, index) => {
                          const fallbackTicket = `${orderInfo.bookingCode ||
                            bookingId}-${traveler.id || index + 1}`;
                          const ticketValue =
                            traveler.ticketCode ||
                            traveler.qrCode ||
                            traveler.ticketNumber ||
                            fallbackTicket;
                          return (
                            <tr key={traveler.id || index}>
                              <td>{index + 1}</td>
                              <td>{traveler.fullName}</td>
                              <td>{formatDate(traveler.dateOfBirth)}</td>
                              <td>{traveler.gender}</td>
                              <td>{traveler.email || "-"}</td>
                              <td>{traveler.phoneNumber || "-"}</td>
                              <td className="passenger-qr-cell">
                                {isPaid() ? (
                                  <button
                                    className="btn-view-ticket"
                                    onClick={() => handleViewTicket(ticketValue)}
                                  >
                                    View Ticket QR
                                  </button>
                                ) : (
                                  <span className="ticket-awaiting">
                                    Available after payment
                                  </span>
                                )}
                              </td>
                              {canModify() && (
                                <td>
                                  <button
                                    className="btn-edit-traveler"
                                    onClick={() => handleEditTraveler(traveler)}
                                  >
                                    Edit
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={canModify() ? 8 : 7} className="no-travelers">
                            No passengers added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="invoice-summary">
                <div className="summary-row">
                  <span>Invoice Code:</span>
                  <strong>{invoiceInfo?.id || "-"}</strong>
                </div>
                <div className="summary-row">
                  <span>Status:</span>
                  <span
                    className={`status-badge ${invoiceInfo?.paymentStatus?.toLowerCase()}`}
                  >
                    {invoiceInfo?.paymentStatus || "PENDING"}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <strong>{formatPrice(orderInfo.totalPrice)} ₫</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                {isCancelled() ? (
                  <div className="cancelled-notice">
                    This booking has been cancelled
                  </div>
                ) : isPaid() ? (
                  <div className="paid-notice">
                    <span className="paid-icon">✓</span>
                    Payment completed
                  </div>
                ) : (
                  <>
                    <button
                      className="btn-cancel"
                      onClick={handleCancelBooking}
                      disabled={submitting || paymentLoading}
                    >
                      Cancel Booking
                    </button>
                    {selectedPaymentMethod === "CASH" ? (
                      <button
                        className="btn-confirm"
                        onClick={handleConfirmPayment}
                        disabled={submitting || paymentLoading}
                      >
                        {submitting ? "Processing..." : "Confirm Payment"}
                      </button>
                    ) : (
                      <>
                        {paymentLinkData && paymentLinkData.checkoutUrl ? (
                          <button
                            className="btn-confirm"
                            onClick={() => setShowPaymentModal(true)}
                            disabled={paymentLoading}
                          >
                            View Payment QR
                          </button>
                        ) : (
                          <button
                            className="btn-confirm"
                            onClick={handleCreatePaymentLink}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? "Creating..." : "Generate Payment"}
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* PayOS Payment Modal */}
      {showPaymentModal && paymentLinkData && (
        <div className="modal-overlay" onClick={handleClosePaymentModal}>
          <div
            className="modal-content payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>PayOS Payment</h3>
              <button
                className="modal-close"
                onClick={handleClosePaymentModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body payment-modal-body">
              <div className="payment-info">
                <p className="payment-amount">
                  Amount: <strong>{formatPrice(paymentLinkData.amount)} ₫</strong>
                </p>
                <p className="payment-order-code">
                  Order Code: <strong>{paymentLinkData.orderCode}</strong>
                </p>
                <p className="payment-description">
                  {paymentLinkData.description}
                </p>
              </div>

              {paymentLinkData.qrCode && (
                <div className="qr-code-container">
                  <QRCode
                    value={paymentLinkData.qrCode}
                    size={180}
                    level="H"
                  />
                  <p className="qr-instruction">
                    Scan this QR code with your banking app to complete payment
                  </p>
                </div>
              )}

              {paymentLinkData.accountNumber && (
                <div className="bank-info">
                  <p>
                    Bank: <strong>{paymentLinkData.accountName}</strong>
                  </p>
                  <p>
                    Account: <strong>{paymentLinkData.accountNumber}</strong>
                  </p>
                  <p>
                    Amount: <strong>{formatPrice(paymentLinkData.amount)} ₫</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTicketModal && ticketModalValue && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div
            className="modal-content ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Ticket QR</h3>
              <button
                className="modal-close"
                onClick={() => setShowTicketModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body ticket-modal-body">
              <QRCode value={ticketModalValue} size={200} level="H" />
              <p className="ticket-code-label ticket-modal-label">
                {ticketModalValue}
              </p>
              <p className="ticket-modal-note">
                Please present this QR code at boarding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Traveler Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Passenger Information</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={travelerForm.fullName}
                  onChange={(e) =>
                    handleTravelerFormChange("fullName", e.target.value)
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={travelerForm.dateOfBirth}
                    onChange={(e) =>
                      handleTravelerFormChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>
                <div className="modal-form-group">
                  <label>Gender</label>
                  <select
                    value={travelerForm.gender}
                    onChange={(e) =>
                      handleTravelerFormChange("gender", e.target.value)
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={travelerForm.email}
                  onChange={(e) =>
                    handleTravelerFormChange("email", e.target.value)
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="modal-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={travelerForm.phoneNumber}
                  onChange={(e) =>
                    handleTravelerFormChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="modal-form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={travelerForm.address}
                  onChange={(e) =>
                    handleTravelerFormChange("address", e.target.value)
                  }
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="btn-modal-save" onClick={submitTravelerEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
