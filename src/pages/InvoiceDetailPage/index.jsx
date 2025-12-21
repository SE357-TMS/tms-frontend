import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import Swal from "sweetalert2";
import api from "../../lib/httpHandler";
import "./InvoiceDetailPage.css";

const InvoiceDetailPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);

	const [invoice, setInvoice] = useState(null);
	const [booking, setBooking] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState("CASH");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setTitle("Order Information");
		setSubtitle("Detailed information about the order");
	}, [setTitle, setSubtitle]);

	useEffect(() => {
		fetchInvoiceDetail();
	}, [id]);

	const fetchInvoiceDetail = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/api/v1/invoices/${id}`);
			const invoiceData = response.data.data;
			setInvoice(invoiceData);
			
			// Fetch booking details
			if (invoiceData.bookingId) {
				const bookingResponse = await api.get(`/api/v1/tour-bookings/${invoiceData.bookingId}`);
				setBooking(bookingResponse.data.data);
			}
			
			setPaymentMethod(invoiceData.paymentMethod || "CASH");
		} catch (err) {
			console.error("Error fetching invoice:", err);
			await Swal.fire({
				icon: "error",
				title: "Error",
				text: "Could not load invoice details",
				confirmButtonColor: "#4D40CA",
			});
			navigate("/invoices");
		} finally {
			setLoading(false);
		}
	};

	const handlePayment = async () => {
		const result = await Swal.fire({
			icon: "question",
			title: "Confirm Payment",
			text: `Confirm payment with method: ${paymentMethod}?`,
			showCancelButton: true,
			confirmButtonColor: "#4D40CA",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, confirm",
			cancelButtonText: "Cancel",
		});

		if (result.isConfirmed) {
			try {
				await api.post(`/api/v1/invoices/${id}/pay`, null, {
					params: { paymentMethod },
				});
				await Swal.fire({
					icon: "success",
					title: "Success",
					text: "Payment confirmed successfully",
					confirmButtonColor: "#4D40CA",
				});
				fetchInvoiceDetail();
			} catch (err) {
				console.error("Error confirming payment:", err);
				await Swal.fire({
					icon: "error",
					title: "Error",
					text: err.response?.data?.message || "Could not confirm payment",
					confirmButtonColor: "#4D40CA",
				});
			}
		}
	};

	const handleCancelOrder = async () => {
		const result = await Swal.fire({
			icon: "warning",
			title: "Cancel Order",
			text: "Are you sure you want to cancel this order?",
			showCancelButton: true,
			confirmButtonColor: "#C34141",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, cancel it",
			cancelButtonText: "No",
		});

		if (result.isConfirmed) {
			try {
				// Cancel booking (which will refund invoice)
				await api.put(`/api/v1/tour-bookings/${booking.id}`, {
					status: "CANCELED",
				});
				await Swal.fire({
					icon: "success",
					title: "Cancelled",
					text: "Order has been cancelled successfully",
					confirmButtonColor: "#4D40CA",
				});
				navigate("/invoices");
			} catch (err) {
				console.error("Error cancelling order:", err);
				await Swal.fire({
					icon: "error",
					title: "Error",
					text: err.response?.data?.message || "Could not cancel order",
					confirmButtonColor: "#4D40CA",
				});
			}
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatPrice = (price) => {
		if (!price) return "0";
		return new Intl.NumberFormat("vi-VN").format(price);
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case "PAID":
				return "Paid";
			case "REFUNDED":
				return "Refunded";
			case "UNPAID":
				return "Wait for payment";
			default:
				return status;
		}
	};

	if (loading) {
		return (
			<div className="invoice-detail-page">
				<div className="loading-container">
					<div className="spinner"></div>
					<p>Loading invoice details...</p>
				</div>
			</div>
		);
	}

	if (!invoice || !booking) {
		return null;
	}

	const isPaid = invoice.paymentStatus === "PAID";
	const isRefunded = invoice.paymentStatus === "REFUNDED";

	return (
		<div className="invoice-detail-page">
			{/* Customer Information Card */}
			<div className="info-card">
				<h3 className="card-title">Customer information</h3>
				<button className="edit-btn" onClick={() => navigate(`/users/${invoice.userId}`)}>
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				<div className="grid-row grid-col-3">
					<div className="field-group">
						<label>Full name</label>
						<div className="field-value">{invoice.userName || "N/A"}</div>
					</div>
					<div className="field-group">
						<label>Sex</label>
						<div className="field-value">{booking.userGender === "M" ? "Male" : "Female"}</div>
					</div>
					<div className="field-group">
						<label>Date of birth</label>
						<div className="field-value">{booking.userBirthday || "N/A"}</div>
					</div>
				</div>

				<div className="grid-row">
					<div className="field-group">
						<label>Phone number</label>
						<div className="field-value">{booking.userPhone || "N/A"}</div>
					</div>
					<div className="field-group">
						<label>E-mail</label>
						<div className="field-value">{booking.userEmail || "N/A"}</div>
					</div>
				</div>

				<div className="grid-row">
					<div className="field-group full-width">
						<label>Address</label>
						<div className="field-value">{booking.userAddress || "N/A"}</div>
					</div>
				</div>
			</div>

			{/* Order Information and Payment Method */}
			<div className="payment-section">
				{/* Order Info Card */}
				<div className="info-card">
					<h3 className="card-title">Order information</h3>

					<div className="grid-row">
						<div className="field-group">
							<label>Order code</label>
							<div className="field-value">{invoice.invoiceCode || "N/A"}</div>
						</div>
						<div className="field-group">
							<label>Creation date</label>
							<div className="field-value">{formatDate(invoice.createdAt)}</div>
						</div>
					</div>

					<div className="grid-row">
						<div className="field-group">
							<label>Number of tours</label>
							<div className="field-value">{booking.numberOfTravelers || 0}</div>
						</div>
						<div className="field-group">
							<label>Status</label>
							<div className="field-value">{getStatusLabel(invoice.paymentStatus)}</div>
						</div>
					</div>

					<div className="grid-row">
						<div className="field-group">
							<label>Total amount</label>
							<div className="field-value">{formatPrice(invoice.totalAmount)}</div>
						</div>
						<div className="field-group">
							<label>Payment date</label>
							<div className="field-value">
								{isPaid ? formatDate(invoice.updatedAt) : "Not yet paid"}
							</div>
						</div>
					</div>
				</div>

				{/* Payment Method Card */}
				{!isPaid && !isRefunded && booking?.status !== 'CANCELED' && (
					<div className="info-card">
						<h3 className="card-title">Choose payment method</h3>
						<div className="payment-methods">
							<div
								className={`payment-option ${paymentMethod === "CASH" ? "active" : ""}`}
								onClick={() => setPaymentMethod("CASH")}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
										<path
											d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"
											fill="currentColor"
										/>
									</svg>
									Cash
								</div>
								<div className="radio-circle">{paymentMethod === "CASH" && <div className="radio-inner"></div>}</div>
							</div>
							<div
								className={`payment-option ${paymentMethod === "TRANSFER" ? "active" : ""}`}
								onClick={() => setPaymentMethod("TRANSFER")}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
										<path
											d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
											fill="currentColor"
										/>
									</svg>
									Transfer
								</div>
								<div className="radio-circle">
									{paymentMethod === "TRANSFER" && <div className="radio-inner"></div>}
								</div>
							</div>
							<div
								className={`payment-option ${paymentMethod === "E_WALLET" ? "active" : ""}`}
								onClick={() => setPaymentMethod("E_WALLET")}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
										<path
											d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
											fill="currentColor"
										/>
									</svg>
									Electronic wallet
								</div>
								<div className="radio-circle">
									{paymentMethod === "E_WALLET" && <div className="radio-inner"></div>}
								</div>
							</div>
						</div>
						<div style={{ display: "flex", justifyContent: "center" }}>
							<button className="btn-confirm" onClick={handlePayment}>
								Payment confirmation
							</button>
						</div>
					</div>
				)}

				{/* Show message for canceled bookings */}
				{!isPaid && !isRefunded && booking?.status === 'CANCELED' && (
					<div className="info-card">
						<h3 className="card-title">Payment Unavailable</h3>
						<p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
							This booking has been canceled. Payment is not available for canceled bookings.
						</p>
					</div>
				)}

				{(isPaid || isRefunded) && (
					<div className="info-card">
						<h3 className="card-title">Payment information</h3>
						<div className="field-group">
							<label>Payment Method</label>
							<div className="field-value">{invoice.paymentMethod || "N/A"}</div>
						</div>
						<div className="field-group">
							<label>Payment Status</label>
							<div className="field-value" style={{ color: isPaid ? "#6FC6A1" : "#FBA0A9", fontWeight: 600 }}>
								{getStatusLabel(invoice.paymentStatus)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* List of Booking Forms */}
			<div>
				<h3 style={{ marginBottom: 15, fontFamily: "Poppins", fontSize: 18, fontWeight: 600 }}>
					List of booking forms
				</h3>
				<div className="table-container">
					<div className="sub-table-header">
						<div>Name of tourist route</div>
						<div>Trip code</div>
						<div>Booking date</div>
						<div style={{ textAlign: "center" }}>Number of seats</div>
						<div style={{ textAlign: "right" }}>Total amount</div>
						<div style={{ textAlign: "center" }}>View</div>
					</div>
					<div className="sub-table-row">
						<div style={{ fontWeight: 500 }}>{booking.routeName || "N/A"}</div>
						<div>{booking.id?.substring(0, 8) || "N/A"}</div>
						<div>{booking.departureDate || "N/A"}</div>
						<div style={{ textAlign: "center" }}>{booking.numberOfTravelers || 0}</div>
						<div style={{ textAlign: "right" }}>{formatPrice(booking.totalPrice)} ₫</div>
						<div style={{ textAlign: "center", color: "#4D40CA", cursor: "pointer" }}>
							<svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} onClick={() => navigate(`/bookings/${booking.id}`)}>
								<path
									d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z"
									stroke="currentColor"
									strokeWidth="2"
								/>
								<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Cancel Order Button */}
			{!isRefunded && (
				<button className="cancel-order-btn" onClick={handleCancelOrder}>
					CANCELLATION OF ORDER
				</button>
			)}
		</div>
	);
};

export default InvoiceDetailPage;
