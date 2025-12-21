import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import Swal from "sweetalert2";
import api from "../../lib/httpHandler";
import "./BookingDetailPage.css";
import EditPassengerModal from "./EditPassengerModal";

const BookingDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);
	const [booking, setBooking] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showEditPassengerModal, setShowEditPassengerModal] = useState(false);
	const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(null);

	useEffect(() => {
		setTitle("Booking information");
		setSubtitle("Detailed information about the booking");
	}, [setTitle, setSubtitle]);

	useEffect(() => {
		fetchBookingDetails();
	}, [id]);

	const fetchBookingDetails = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/api/v1/tour-bookings/${id}`);
			setBooking(response.data.data);
		} catch (err) {
			console.error("Error fetching booking details:", err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Unable to load booking details",
				confirmButtonColor: "#4D40CA",
			}).then(() => {
				navigate("/bookings");
			});
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB").replace(/\//g, "/");
	};

	const formatTime = (timeString) => {
		if (!timeString) return "N/A";
		// timeString format: "HH:mm:ss" or "HH:mm"
		const timeParts = timeString.split(":");
		return `${timeParts[0]}:${timeParts[1]}`;
	};

	const formatPrice = (price) => {
		if (!price) return "0 VND";
		return new Intl.NumberFormat("vi-VN").format(price) + " VND";
	};

	const getPaymentStatusText = (status) => {
		switch (status) {
			case "UNPAID":
				return "Not paid";
			case "PAID":
				return "Paid";
			case "REFUNDED":
				return "Refunded";
			default:
				return status || "N/A";
		}
	};

	const canEditTravelers = (() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const departure = booking?.departureDate
			? new Date(`${booking.departureDate}T00:00:00`)
			: null;
		const daysToDeparture = departure
			? Math.floor((departure - today) / (1000 * 60 * 60 * 24))
			: 0;
		const isUnpaid = booking?.invoice?.paymentStatus === "UNPAID";
		const isDeparted = departure ? departure <= today : false;
		const lockedStatus = booking?.status === "CANCELED" || booking?.status === "COMPLETED";
		return !isDeparted && !lockedStatus && (isUnpaid || daysToDeparture > 3);
	})();

	const handleEditPassenger = (index) => {
		if (!canEditTravelers) {
			Swal.fire({
				icon: "warning",
				title: "Cannot edit",
				text: "Travelers can be edited only when booking is unpaid or departure is more than 3 days away.",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}
		setSelectedPassengerIndex(index);
		setShowEditPassengerModal(true);
	};

	const handlePassengerUpdated = () => {
		fetchBookingDetails();
		setShowEditPassengerModal(false);
		setSelectedPassengerIndex(null);
	};

	const handleViewInvoice = async () => {
		try {
			if (!booking?.id) return;
			const response = await api.get(`/api/v1/invoices/booking/${booking.id}`);
			const invoiceData = response?.data?.data ?? response?.data;
			const invoiceId = invoiceData?.id;
			if (!invoiceId) {
				await Swal.fire({
					icon: "error",
					title: "Error",
					text: "Could not determine invoice id for this booking",
					confirmButtonColor: "#4D40CA",
				});
				return;
			}
			navigate(`/invoices/${invoiceId}`);
		} catch (err) {
			console.error("Error fetching invoice:", err);
			if (err.response?.status === 404) {
				Swal.fire({
					icon: "info",
					title: "No Invoice",
					text: "No invoice found for this booking",
					confirmButtonColor: "#4D40CA",
				});
			} else {
				Swal.fire({
					icon: "error",
					title: "Error",
					text: "Could not load invoice",
					confirmButtonColor: "#4D40CA",
				});
			}
		}
	};

	if (loading) {
		return <div className="booking-detail-loading">Loading...</div>;
	}

	if (!booking) {
		return null;
	}

	return (
		<div className="booking-detail-page">
			<div className="booking-detail-container">
				<div className="booking-detail-content">
					{/* Tour Name */}
					<h3 className="tour-name">{booking.routeName || "Tour name"}</h3>

					{/* Tour Information Grid */}
					<div className="tour-info-grid">
						<div className="info-row">
							<div className="info-item">
								<label>Tour code</label>
								<div className="info-value">{booking.tripId || "N/A"}</div>
							</div>
							<div className="info-item">
								<label>Departure date</label>
								<div className="info-value">{formatDate(booking.departureDate)}</div>
							</div>
							<div className="info-item">
								<label>Return date</label>
								<div className="info-value">{formatDate(booking.returnDate)}</div>
							</div>
						</div>

						<div className="info-row">
							<div className="info-item">
								<label>Departure time</label>
								<div className="info-value">{formatTime(booking.pickUpTime)}</div>
							</div>
							<div className="info-item">
								<label>Departure point</label>
								<div className="info-value">{booking.pickUpLocation || "N/A"}</div>
							</div>
							<div className="info-item">
								<label>Price</label>
								<div className="info-value">{formatPrice(booking.totalPrice)}</div>
							</div>
						</div>

						<div className="info-row">
							<div className="info-item">
								<label>Number of booked passengers</label>
								<div className="info-value">{booking.travelers?.length || 0}</div>
							</div>
							<div className="info-item">
								<label>Total amount</label>
								<div className="info-value">{formatPrice(booking.totalPrice)}</div>
							</div>
							<div className="info-item">
								<label>Payment status</label>
								<div className="info-value">{getPaymentStatusText(booking.invoice?.paymentStatus)}</div>
							</div>
						</div>
					</div>

					{/* Passenger List */}
					<div className="passenger-section">
						<h4 className="passenger-title">Passenger list</h4>

						<div className="passenger-table">
							<div className="passenger-table-header">
								<div className="col-no">No.</div>
								<div className="col-name">Full name</div>
								<div className="col-phone">Phone number</div>
								<div className="col-email">Email</div>
								<div className="col-edit">Edit</div>
							</div>

							{booking.travelers?.map((traveler, index) => (
								<div key={index} className="passenger-table-row">
									<div className="col-no">{index + 1}</div>
									<div className="col-name">{traveler.fullName || "N/A"}</div>
									<div className="col-phone">{traveler.phoneNumber || "N/A"}</div>
									<div className="col-email">{traveler.email || "N/A"}</div>
									<div className="col-edit">
										<button
											className="edit-passenger-btn"
											onClick={() => handleEditPassenger(index)}
											disabled={!canEditTravelers}
										>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
												<path
													d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.8787 20 1.8787C20.5626 1.8787 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.4374 22.1213 4C22.1213 4.5626 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
													stroke="#4D40CA"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</button>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* View Invoice Button */}
					<div className="booking-detail-actions">
						<button
							className="edit-booking-btn"
							onClick={() => navigate(`/bookings/${booking.id}/edit`)}
							disabled={!canEditTravelers}
						>
							Edit booking
						</button>
						<button className="view-invoice-btn" onClick={handleViewInvoice}>
							View invoice information
						</button>
					</div>
				</div>
			</div>

			{/* Edit Passenger Modal */}
			{showEditPassengerModal && selectedPassengerIndex !== null && (
				<EditPassengerModal
					traveler={booking.travelers[selectedPassengerIndex]}
					onClose={() => {
						setShowEditPassengerModal(false);
						setSelectedPassengerIndex(null);
					}}
					onSave={handlePassengerUpdated}
					bookingId={booking.id}
					travelerIndex={selectedPassengerIndex}
				/>
			)}
		</div>
	);
};

export default BookingDetailPage;
