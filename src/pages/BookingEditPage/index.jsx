import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import Swal from "sweetalert2";
import api from "../../lib/httpHandler";
import "./BookingEditPage.css";

const BookingEditPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);

	// State for booking data
	const [booking, setBooking] = useState(null);
	const [status, setStatus] = useState("PENDING");
	const [travelers, setTravelers] = useState([]);

	// State for loading and errors
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		setTitle("Edit Booking");
		setSubtitle("Update booking information");
	}, [setTitle, setSubtitle]);

	// Fetch booking details
	useEffect(() => {
		const fetchBooking = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/api/v1/tour-bookings/${id}`);
				const bookingData = response.data.data;
				
				setBooking(bookingData);
				setStatus(bookingData.status || "PENDING");
				
				if (bookingData.travelers && bookingData.travelers.length > 0) {
					setTravelers(
						bookingData.travelers.map((t) => ({
							id: t.id,
							fullName: t.fullName || "",
							gender: t.gender || "M",
							dateOfBirth: t.dateOfBirth || "",
							identityDoc: t.identityDoc || "",
						}))
					);
				}
			} catch (err) {
				console.error("Error fetching booking:", err);
				await Swal.fire({
					icon: "error",
					title: "Error",
					text: "Could not load booking details",
					confirmButtonColor: "#4D40CA",
				});
				navigate("/bookings");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchBooking();
		}
	}, [id, navigate]);

	// Handle traveler field change
	const handleTravelerChange = (index, field, value) => {
		const newTravelers = [...travelers];
		newTravelers[index] = {
			...newTravelers[index],
			[field]: value,
		};
		setTravelers(newTravelers);
	};

	// Validate form
	const validate = () => {
		const newErrors = {};

		travelers.forEach((traveler, index) => {
			if (!traveler.fullName.trim()) {
				newErrors[`traveler_${index}_name`] = "Please enter full name";
			}
			if (!traveler.dateOfBirth) {
				newErrors[`traveler_${index}_dob`] = "Please enter date of birth";
			}
		});

		return newErrors;
	};

	// Handle submit
	const handleSubmit = async () => {
		const newErrors = validate();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			setSubmitting(true);

			const requestData = {
				status: status,
				travelers: travelers.map((t) => ({
					id: t.id,
					fullName: t.fullName,
					gender: t.gender,
					dateOfBirth: t.dateOfBirth,
					identityDoc: t.identityDoc,
				})),
			};

			await api.put(`/api/v1/tour-bookings/${id}`, requestData);

			await Swal.fire({
				icon: "success",
				title: "Success",
				text: "Booking has been updated successfully",
				confirmButtonColor: "#4D40CA",
			});

			navigate("/bookings");
		} catch (err) {
			console.error("Error updating booking:", err);
			await Swal.fire({
				icon: "error",
				title: "Error",
				text: err.response?.data?.message || "Could not update booking",
				confirmButtonColor: "#4D40CA",
			});
		} finally {
			setSubmitting(false);
		}
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB");
	};

	// Format price
	const formatPrice = (price) => {
		if (!price) return "0 ₫";
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price);
	};

	if (loading) {
		return (
			<div className="booking-edit-page">
				<div className="loading-container">
					<div className="spinner"></div>
					<p>Loading booking details...</p>
				</div>
			</div>
		);
	}

	if (!booking) {
		return null;
	}

	return (
		<div className="booking-edit-page">
			<div className="booking-edit-container">
				{/* Close Button */}
				<button className="booking-edit-close" onClick={() => navigate("/bookings")}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke="#1D1B20"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				{/* Title */}
				<h2 className="booking-edit-title">
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Edit Booking
				</h2>

				{/* Body */}
				<div className="booking-edit-body">
					{/* Tour Information - Read Only */}
					<div className="booking-section">
						<h3 className="booking-section-title">Tour Information</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Tour Name</label>
								<p>{booking.routeName || "N/A"}</p>
							</div>
							<div className="booking-detail-field">
								<label>Departure Date</label>
								<p>{formatDate(booking.departureDate)}</p>
							</div>
							<div className="booking-detail-field">
								<label>Return Date</label>
								<p>{formatDate(booking.returnDate)}</p>
							</div>
							<div className="booking-detail-field">
								<label>Total Price</label>
								<p style={{ color: "#4D40CA", fontWeight: 700 }}>
									{formatPrice(booking.totalPrice)}
								</p>
							</div>
						</div>
					</div>

					{/* Customer Information - Read Only */}
					<div className="booking-section">
						<h3 className="booking-section-title">Customer Information</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Full Name</label>
								<p>{booking.userName || "N/A"}</p>
							</div>
							<div className="booking-detail-field">
								<label>Email</label>
								<p>{booking.userEmail || "N/A"}</p>
							</div>
						</div>
					</div>

					{/* Status Update */}
					<div className="booking-section">
						<h3 className="booking-section-title">Update Status</h3>
						<div className="booking-form-group" style={{ width: "250px" }}>
							<label>Status</label>
							<select value={status} onChange={(e) => setStatus(e.target.value)}>
								<option value="PENDING">Pending</option>
								<option value="CONFIRMED">Confirmed</option>
								<option value="COMPLETED">Completed</option>
							</select>
						</div>
					</div>

					{/* Travelers Information - Editable */}
					{travelers.length > 0 && (
						<div className="booking-section">
							<h3 className="booking-section-title">Traveler Information</h3>
							{travelers.map((traveler, index) => (
								<div key={traveler.id || index} className="traveler-section">
									<div className="traveler-title">Traveler {index + 1}:</div>
									<div className="traveler-row">
										{/* Name */}
										<div className="booking-form-group name-field">
											<label>
												Full Name <span className="required">*</span>
											</label>
											<input
												type="text"
												value={traveler.fullName}
												onChange={(e) => handleTravelerChange(index, "fullName", e.target.value)}
												placeholder="Enter full name"
											/>
											{errors[`traveler_${index}_name`] && (
												<span className="error-text">{errors[`traveler_${index}_name`]}</span>
											)}
										</div>

										{/* Gender */}
										<div className="booking-form-group">
											<label>Gender</label>
											<select value={traveler.gender} onChange={(e) => handleTravelerChange(index, "gender", e.target.value)}>
												<option value="M">Male</option>
												<option value="F">Female</option>
												<option value="O">Other</option>
											</select>
										</div>

										{/* Date of Birth */}
										<div className="booking-form-group">
											<label>
												Date of Birth <span className="required">*</span>
											</label>
											<input
												type="date"
												value={traveler.dateOfBirth}
												onChange={(e) => handleTravelerChange(index, "dateOfBirth", e.target.value)}
											/>
											{errors[`traveler_${index}_dob`] && <span className="error-text">{errors[`traveler_${index}_dob`]}</span>}
										</div>

										{/* Identity Doc */}
										<div className="booking-form-group">
											<label>
												ID/Passport <span className="required">*</span>
											</label>
											<input
												type="text"
												value={traveler.identityDoc}
												onChange={(e) => handleTravelerChange(index, "identityDoc", e.target.value)}
												placeholder="ID/Passport number"
											/>
											{errors[`traveler_${index}_doc`] && <span className="error-text">{errors[`traveler_${index}_doc`]}</span>}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="booking-edit-footer">
					<button type="button" className="btn-booking-cancel" onClick={() => navigate("/bookings")}>
						Cancel
					</button>
					<button type="button" className="btn-booking-confirm" onClick={handleSubmit} disabled={submitting}>
						{submitting ? "Processing..." : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BookingEditPage;
