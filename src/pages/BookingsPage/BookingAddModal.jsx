import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./BookingAddModal.css";
import api from "../../lib/httpHandler";

const BookingAddModal = ({ onClose, onSave }) => {
	// State for form data
	const [selectedTrip, setSelectedTrip] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [passengerCount, setPassengerCount] = useState(1);
	const [travelers, setTravelers] = useState([createEmptyTraveler()]);

	// State for dropdown data
	const [trips, setTrips] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [loadingTrips, setLoadingTrips] = useState(true);
	const [loadingCustomers, setLoadingCustomers] = useState(true);

	// State for customer dropdown
	const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
	const [customerSearchText, setCustomerSearchText] = useState("");

	// State for traveler dropdowns
	const [openTravelerDropdown, setOpenTravelerDropdown] = useState(null);

	// State for submission
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// Create empty traveler object
	function createEmptyTraveler() {
		return {
			fullName: "",
			gender: "M",
			dateOfBirth: "",
			identityDoc: "",
			isFromDropdown: false,
			selectedCustomerId: null,
		};
	}

	// Fetch trips
	useEffect(() => {
		const fetchTrips = async () => {
			try {
				setLoadingTrips(true);
				const response = await api.get("/api/v1/trips/all");
				// Filter only OPEN trips with available seats
				const openTrips = (response.data.data || []).filter(
					(trip) => trip.status === "OPEN" && trip.availableSeats > 0
				);
				setTrips(openTrips);
			} catch (err) {
				console.error("Error fetching trips:", err);
			} finally {
				setLoadingTrips(false);
			}
		};
		fetchTrips();
	}, []);

	// Fetch customers
	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoadingCustomers(true);
				const response = await api.get("/admin/users", {
					params: { role: "CUSTOMER", size: 100 },
				});
				setCustomers(response.data.data?.content || []);
			} catch (err) {
				console.error("Error fetching customers:", err);
			} finally {
				setLoadingCustomers(false);
			}
		};
		fetchCustomers();
	}, []);

	// Handle passenger count change
	const handlePassengerCountChange = (delta) => {
		const newCount = passengerCount + delta;
		if (newCount >= 1 && newCount <= 10) {
			setPassengerCount(newCount);

			if (delta > 0) {
				// Add new traveler
				setTravelers([...travelers, createEmptyTraveler()]);
			} else {
				// Remove last traveler
				setTravelers(travelers.slice(0, -1));
			}
		}
	};

	// Handle customer selection
	const handleCustomerSelect = (customer) => {
		setSelectedCustomer(customer);
		setCustomerSearchText(customer.fullName);
		setShowCustomerDropdown(false);
	};

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

	// Handle traveler selection from dropdown
	const handleTravelerSelect = (index, customer) => {
		if (customer === "new") {
			// Create new traveler manually
			const newTravelers = [...travelers];
			newTravelers[index] = createEmptyTraveler();
			setTravelers(newTravelers);
		} else {
			// Select existing customer as traveler
			const newTravelers = [...travelers];
			newTravelers[index] = {
				fullName: customer.fullName,
				gender: customer.gender || "M",
				dateOfBirth: customer.birthday || "",
				identityDoc: customer.phoneNumber || "",
				isFromDropdown: true,
				selectedCustomerId: customer.id,
			};
			setTravelers(newTravelers);
		}
		setOpenTravelerDropdown(null);
	};

	// Validate form
	const validate = () => {
		const newErrors = {};

		if (!selectedTrip) {
			newErrors.trip = "Please select a trip";
		}


		// Allow booking when a traveler was chosen from dropdown (use that customer's id)
		const travelerCustomer = travelers.find((t) => t.selectedCustomerId);
		if (!selectedCustomer && !travelerCustomer) {
			newErrors.customer = "Please select a customer";
		}

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
			setLoading(true);

			// Determine userId: explicit selectedCustomer first, else traveler-selected customer
			const travelerCustomerId = travelers.find((t) => t.selectedCustomerId)?.selectedCustomerId;
			const userId = selectedCustomer ? selectedCustomer.id : travelerCustomerId;

			// If no userId determined yet, try to create customer from first traveler (needs email)
			let finalUserId = userId;
			if (!finalUserId) {
				const primaryTraveler = travelers[0];
				if (primaryTraveler && primaryTraveler.email) {
					try {
						const usernameBase = primaryTraveler.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
						const payload = {
							username: `${usernameBase}_${Date.now()}`,
							password: Math.random().toString(36).slice(-8),
							fullName: primaryTraveler.fullName || usernameBase,
							email: primaryTraveler.email,
							phoneNumber: primaryTraveler.identityDoc || null,
						};
						const resp = await api.post('/admin/users', payload);
						finalUserId = resp.data.data.id;
					} catch (err) {
						console.error('Error creating customer:', err);
						await Swal.fire({ icon: 'error', title: 'Error', text: 'Could not create customer account for booking. Please select an existing customer or provide traveler email.', confirmButtonColor: '#4D40CA' });
						setLoading(false);
						return;
					}
				}
			}

			const requestData = {
				tripId: selectedTrip,
				userId: finalUserId,
				noAdults: passengerCount,
				noChildren: 0,
				travelers: travelers.map((t) => ({
					fullName: t.fullName,
					gender: t.gender,
					dateOfBirth: t.dateOfBirth,
					identityDoc: t.identityDoc || null,
				})),
			};

			await api.post("/api/v1/tour-bookings", requestData);

			await Swal.fire({
				icon: "success",
				title: "Success",
				text: "Booking has been created successfully",
				confirmButtonColor: "#4D40CA",
			});

			onSave();
		} catch (err) {
			console.error("Error creating booking:", err);
			await Swal.fire({
				icon: "error",
				title: "Error",
				text: err.response?.data?.message || "Could not create booking",
				confirmButtonColor: "#4D40CA",
			});
		} finally {
			setLoading(false);
		}
	};

	// Filter customers by search text
	const filteredCustomers = customers.filter(
		(c) =>
			c.fullName?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
			c.email?.toLowerCase().includes(customerSearchText.toLowerCase())
	);

	// Get selected trip info
	const selectedTripInfo = trips.find((t) => t.id === selectedTrip);

	return (
		<div className="booking-modal-overlay" onClick={onClose}>
			<div
				className="booking-modal-container booking-add-modal"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<button
					className="booking-modal-close"
					onClick={onClose}
					aria-label="Close"
				>
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
				
				<h2 className="booking-modal-title">
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M5 13L9 17L19 7"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Add new booking
				</h2>

				{/* Body */}
				<div className="booking-modal-body">
					{/* Trip Selection */}
					<div className="trip-select-section">
						<div
							className="booking-form-group"
							style={{ width: "100%", maxWidth: "500px" }}
						>
							<label>
								Select Trip <span className="required">*</span>
							</label>
							<select
								value={selectedTrip}
								onChange={(e) => setSelectedTrip(e.target.value)}
								disabled={loadingTrips}
							>
								<option value="">-- Select a trip --</option>
								{trips.map((trip) => (
									<option key={trip.id} value={trip.id}>
										{trip.routeName} -{" "}
										{new Date(trip.departureDate).toLocaleDateString("en-GB")} (
										{trip.availableSeats} seats available)
									</option>
								))}
							</select>
							{errors.trip && <span className="error-text">{errors.trip}</span>}
						</div>
					</div>

					{/* Customer Information Section */}
					<div className="booking-section">
						<h3 className="booking-section-title">Customer Information</h3>
						<div className="customer-info-grid">
							{/* Customer Name Select */}
							<div className="booking-form-group name">
								<label>Full Name</label>
								<div className="customer-select-wrapper">
									<button
										type="button"
										className={`customer-select-btn ${
											showCustomerDropdown ? "open" : ""
										}`}
										onClick={() =>
											setShowCustomerDropdown(!showCustomerDropdown)
										}
									>
										<span>{selectedCustomer?.fullName || "Full Name"}</span>
										<svg viewBox="0 0 24 24" fill="none">
											<path
												d="M6 9L12 15L18 9"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
											/>
										</svg>
									</button>
									{showCustomerDropdown && (
										<div className="customer-dropdown">
											{loadingCustomers ? (
												<div className="customer-dropdown-item">Loading...</div>
											) : (
												filteredCustomers.map((customer) => (
													<div
														key={customer.id}
														className={`customer-dropdown-item ${
															selectedCustomer?.id === customer.id
																? "selected"
																: ""
														}`}
														onClick={() => handleCustomerSelect(customer)}
													>
														{customer.fullName}
													</div>
												))
											)}
										</div>
									)}
								</div>
								{errors.customer && (
									<span className="error-text">{errors.customer}</span>
								)}
							</div>

							{/* Gender - Read Only */}
							<div className="booking-form-group gender">
								<label>Gender</label>
								<input
									type="text"
									value={
										selectedCustomer?.gender === "M"
											? "Male"
											: selectedCustomer?.gender === "F"
											? "Female"
											: selectedCustomer?.gender || "Gender"
									}
									readOnly
								/>
							</div>

							{/* Birthday - Read Only */}
							<div className="booking-form-group birthday">
								<label>Date of Birth</label>
								<input
									type="text"
									value={selectedCustomer?.birthday || "Date of Birth"}
									readOnly
								/>
							</div>

							{/* Email - Read Only */}
							<div className="booking-form-group email">
								<label>Email</label>
								<input
									type="text"
									value={selectedCustomer?.email || "Email"}
									readOnly
								/>
							</div>

							{/* Phone - Read Only */}
							<div className="booking-form-group phone">
								<label>Phone Number</label>
								<input
									type="text"
									value={selectedCustomer?.phoneNumber || "Phone Number"}
									readOnly
								/>
							</div>

							{/* Address - Read Only */}
							<div className="booking-form-group address">
								<label>Address</label>
								<input
									type="text"
									value={selectedCustomer?.address || "Address"}
									readOnly
								/>
							</div>
						</div>
					</div>

					{/* Passenger Section */}
					<div className="booking-section">
						{/* Passenger Count */}
						<div className="passenger-count-section">
							<span className="passenger-count-label">
								Number of Passengers:
							</span>
							<div className="passenger-counter">
								<button
									type="button"
									className="counter-btn"
									onClick={() => handlePassengerCountChange(-1)}
									disabled={passengerCount <= 1}
								>
									−
								</button>
								<span className="counter-value">{passengerCount}</span>
								<button
									type="button"
									className="counter-btn"
									onClick={() => handlePassengerCountChange(1)}
									disabled={
										passengerCount >= 10 ||
										(selectedTripInfo &&
											passengerCount >= selectedTripInfo.availableSeats)
									}
								>
									+
								</button>
							</div>
						</div>

						<h3 className="booking-section-title">Traveler Information</h3>

						{/* Travelers */}
						{travelers.map((traveler, index) => (
							<div key={index} className="traveler-section">
								<div className="traveler-title">
									Traveler {index + 1} Information:
								</div>
								<div className="traveler-row">
									{/* Name with dropdown */}
									<div className="booking-form-group name-field">
										<label className="label-required">Full Name:</label>
										<div className="traveler-select-wrapper">
											<button
												type="button"
												className={`traveler-select-btn ${
													openTravelerDropdown === index ? "open" : ""
												}`}
												onClick={() =>
													setOpenTravelerDropdown(
														openTravelerDropdown === index ? null : index
													)
												}
											>
												<span>{traveler.fullName || "Search ..."}</span>
												<svg viewBox="0 0 24 24" fill="none">
													<path
														d="M6 9L12 15L18 9"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
													/>
												</svg>
											</button>
											{openTravelerDropdown === index && (
												<div className="traveler-dropdown">
													<div
														className="traveler-dropdown-item add-new"
														onClick={() => handleTravelerSelect(index, "new")}
													>
														Add new traveler
													</div>
													{customers.map((customer) => (
														<div
															key={customer.id}
															className="traveler-dropdown-item"
															onClick={() =>
																handleTravelerSelect(index, customer)
															}
														>
															{customer.fullName}
														</div>
													))}
												</div>
											)}
										</div>
										{!traveler.isFromDropdown && (
											<input
												type="text"
												value={traveler.fullName}
												onChange={(e) =>
													handleTravelerChange(
														index,
														"fullName",
														e.target.value
													)
												}
												placeholder="Enter full name"
												style={{ marginTop: "8px" }}
											/>
										)}
										{errors[`traveler_${index}_name`] && (
											<span className="error-text">
												{errors[`traveler_${index}_name`]}
											</span>
										)}
									</div>

									{/* Email */}
									<div className="booking-form-group">
										<label className="label-required">Email</label>
										<input
											type="email"
											placeholder="Example@gmail.com"
											value={
												traveler.isFromDropdown
													? customers.find(
															(c) => c.id === traveler.selectedCustomerId
													  )?.email || ""
													: ""
											}
											readOnly={traveler.isFromDropdown}
										/>
									</div>

									{/* Phone */}
									<div className="booking-form-group phone-field">
										<label>Phone Number</label>
										<input
											type="text"
											placeholder="Phone Number"
											value={traveler.identityDoc}
											onChange={(e) =>
												handleTravelerChange(
													index,
													"identityDoc",
													e.target.value
												)
											}
											readOnly={traveler.isFromDropdown}
										/>
										{errors[`traveler_${index}_doc`] && (
											<span className="error-text">
												{errors[`traveler_${index}_doc`]}
											</span>
										)}
									</div>

									{/* Gender */}
									<div className="booking-form-group">
										<label>Gender</label>
										<select
											value={traveler.gender}
											onChange={(e) =>
												handleTravelerChange(index, "gender", e.target.value)
											}
											disabled={traveler.isFromDropdown}
										>
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
											onChange={(e) =>
												handleTravelerChange(
													index,
													"dateOfBirth",
													e.target.value
												)
											}
											disabled={traveler.isFromDropdown}
										/>
										{errors[`traveler_${index}_dob`] && (
											<span className="error-text">
												{errors[`traveler_${index}_dob`]}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="booking-modal-footer">
					<button
						type="button"
						className="btn-booking-cancel"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn-booking-confirm"
						onClick={handleSubmit}
						disabled={loading}
					>
						{loading ? "Processing..." : "Confirm"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BookingAddModal;
