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
	const [canEditTravelers, setCanEditTravelers] = useState(false);
	const [isPaid, setIsPaid] = useState(false);

	// State for customers dropdown (like BookingAddPage)
	const [customers, setCustomers] = useState([]);
	const [loadingCustomers, setLoadingCustomers] = useState(false);
	const [openTravelerDropdown, setOpenTravelerDropdown] = useState(null);

	// State for loading and errors
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		setTitle("Edit Booking");
		setSubtitle("Update booking information");
	}, [setTitle, setSubtitle]);

	// Fetch customers for dropdown
	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoadingCustomers(true);
				const response = await api.get("/admin/users", {
					params: { role: "CUSTOMER", size: 100 },
				});
				setCustomers(response.data.data?.items || []);
			} catch (err) {
				console.error("Error fetching customers:", err);
			} finally {
				setLoadingCustomers(false);
			}
		};
		fetchCustomers();
	}, []);

	// Fetch booking details
	useEffect(() => {
		const fetchBooking = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/api/v1/tour-bookings/${id}`);
				const bookingData = response.data.data;
				
				setBooking(bookingData);
				setStatus(bookingData.status || "PENDING");
				
				// Compute traveler edit permission
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const departure = bookingData.departureDate
					? new Date(`${bookingData.departureDate}T00:00:00`)
					: null;
				const daysToDeparture = departure
					? Math.floor((departure - today) / (1000 * 60 * 60 * 24))
					: 0;
				const isUnpaid = bookingData.invoice?.paymentStatus === "UNPAID";
				const paidStatus = bookingData.invoice?.paymentStatus === "PAID";
				const isDeparted = departure ? departure <= today : false;
				const lockedStatus =
					bookingData.status === "CANCELED" || bookingData.status === "COMPLETED";
				
				setIsPaid(paidStatus);
				setCanEditTravelers(!isDeparted && !lockedStatus && (isUnpaid || daysToDeparture > 3));

				if (bookingData.travelers && bookingData.travelers.length > 0) {
					setTravelers(
						bookingData.travelers.map((t) => ({
							id: t.id,
							fullName: t.fullName || "",
							gender: t.gender || "M",
							dateOfBirth: t.dateOfBirth || "",
							identityDoc: t.identityDoc || "",
							email: t.email || "",
							phoneNumber: t.phoneNumber || "",
							isFromDropdown: false,
							selectedCustomerId: null,
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
			isFromDropdown: false,
		};
		setTravelers(newTravelers);
	};

	// Handle traveler selection from dropdown (like BookingAddPage)
	const handleTravelerSelect = (index, customer) => {
		if (customer === "new") {
			const newTravelers = [...travelers];
			newTravelers[index] = createEmptyTraveler();
			setTravelers(newTravelers);
		} else {
			const newTravelers = [...travelers];
			newTravelers[index] = {
				id: null,
				fullName: customer.fullName,
				gender: customer.gender || "M",
				dateOfBirth: customer.birthday || "",
				identityDoc: customer.identityDoc || "",
				email: customer.email || "",
				phoneNumber: customer.phoneNumber || "",
				isFromDropdown: true,
				selectedCustomerId: customer.id,
			};
			setTravelers(newTravelers);
		}
		setOpenTravelerDropdown(null);
	};

	const createEmptyTraveler = () => ({
		id: null,
		fullName: "",
		gender: "M",
		dateOfBirth: "",
		identityDoc: "",
		email: "",
		phoneNumber: "",
		isFromDropdown: false,
		selectedCustomerId: null,
	});

	const handleAddTraveler = () => {
		setTravelers((prev) => [...prev, createEmptyTraveler()]);
	};

	const handleRemoveTraveler = (index) => {
		setTravelers((prev) => prev.filter((_, i) => i !== index));
	};

	// Validate form
	const validate = () => {
		const newErrors = {};

		if (canEditTravelers) {
			travelers.forEach((traveler, index) => {
				if (!traveler.fullName.trim()) {
					newErrors[`traveler_${index}_name`] = "Please enter full name";
				}
				if (!traveler.email?.trim()) {
					newErrors[`traveler_${index}_email`] = "Please enter email";
				} else if (!/^\S+@\S+\.\S+$/.test(traveler.email.trim())) {
					newErrors[`traveler_${index}_email`] = "Invalid email";
				}
				if (!traveler.phoneNumber?.trim()) {
					newErrors[`traveler_${index}_phone`] = "Please enter phone number";
				}
			});
		}

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
			};
			if (canEditTravelers) {
				requestData.travelers = travelers.map((t) => ({
					fullName: t.fullName,
					gender: t.gender || null,
					dateOfBirth: t.dateOfBirth ? t.dateOfBirth : null,
					identityDoc: t.identityDoc || null,
					email: t.email?.trim() || null,
					phoneNumber: t.phoneNumber?.trim() || null,
				}));
			}

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
	// Check if can add/remove travelers (only when unpaid)
	const canAddRemoveTravelers = canEditTravelers && !isPaid;
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

					{/* Travelers Information - Editable with Dropdown */}
					{travelers.length > 0 && (
						<div className="booking-section">
							<div className="traveler-header">
								<h3 className="booking-section-title">Traveler Information</h3>
								{canAddRemoveTravelers && (
									<button type="button" className="btn-traveler-add" onClick={handleAddTraveler}>
										Add traveler
									</button>
								)}
							</div>
							{!canEditTravelers && (
								<p className="traveler-edit-note">
									Travelers can be edited only when booking is unpaid or departure is more than 3 days away.
								</p>
							)}
							{canEditTravelers && isPaid && (
								<p className="traveler-edit-note" style={{ color: "#f39c12" }}>
									Payment completed. You can update traveler details but cannot add or remove travelers.
								</p>
							)}
							{travelers.map((traveler, index) => (
								<div key={traveler.id || index} className="traveler-section">
									<div className="traveler-title">
										<span>Traveler {index + 1}:</span>
										{canAddRemoveTravelers && (
											<button
												type="button"
												className="btn-traveler-remove"
												onClick={() => handleRemoveTraveler(index)}
												disabled={travelers.length <= 1}
											>
												Remove
											</button>
										)}
									</div>
									<div className="traveler-row">
										{/* Name with dropdown (like BookingAddPage) */}
										<div className="booking-form-group name-field">
											<label>
												Full Name <span className="required">*</span>
											</label>
											{canEditTravelers && canAddRemoveTravelers ? (
												<>
													<div className="traveler-select-wrapper">
														<button
															type="button"
															className={`traveler-select-btn ${openTravelerDropdown === index ? "open" : ""}`}
															onClick={() => setOpenTravelerDropdown(openTravelerDropdown === index ? null : index)}
														>
															<span>{traveler.fullName || "Search ..."}</span>
															<svg viewBox="0 0 24 24" fill="none">
																<path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
															</svg>
														</button>
														{openTravelerDropdown === index && (
															<div className="traveler-dropdown">
																<div className="traveler-dropdown-item add-new" onClick={() => handleTravelerSelect(index, "new")}>
																	Add new traveler
																</div>
																{loadingCustomers ? (
																	<div className="traveler-dropdown-item">Loading...</div>
																) : (
																	customers.map((customer) => (
																		<div
																			key={customer.id}
																			className="traveler-dropdown-item"
																			onClick={() => handleTravelerSelect(index, customer)}
																		>
																			{customer.fullName}
																		</div>
																	))
																)}
															</div>
														)}
													</div>
													{!traveler.isFromDropdown && (
														<input
															type="text"
															value={traveler.fullName}
															onChange={(e) => handleTravelerChange(index, "fullName", e.target.value)}
															placeholder="Enter full name"
															style={{ marginTop: "8px" }}
														/>
													)}
												</>
											) : (
												<input
													type="text"
													value={traveler.fullName}
													onChange={(e) => handleTravelerChange(index, "fullName", e.target.value)}
													placeholder="Enter full name"
													disabled={!canEditTravelers}
												/>
											)}
											{errors[`traveler_${index}_name`] && (
												<span className="error-text">{errors[`traveler_${index}_name`]}</span>
											)}
										</div>

										{/* Email */}
										<div className="booking-form-group">
											<label>
												Email <span className="required">*</span>
											</label>
											<input
												type="email"
												value={traveler.email}
												onChange={(e) => handleTravelerChange(index, "email", e.target.value)}
												placeholder="Example@gmail.com"
												disabled={!canEditTravelers}
												readOnly={traveler.isFromDropdown && canAddRemoveTravelers}
											/>
											{errors[`traveler_${index}_email`] && (
												<span className="error-text">{errors[`traveler_${index}_email`]}</span>
											)}
										</div>

										{/* Phone */}
										<div className="booking-form-group">
											<label>
												Phone Number <span className="required">*</span>
											</label>
											<input
												type="text"
												value={traveler.phoneNumber}
												onChange={(e) => handleTravelerChange(index, "phoneNumber", e.target.value)}
												placeholder="Phone Number"
												disabled={!canEditTravelers}
												readOnly={traveler.isFromDropdown && canAddRemoveTravelers}
											/>
											{errors[`traveler_${index}_phone`] && (
												<span className="error-text">{errors[`traveler_${index}_phone`]}</span>
											)}
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
