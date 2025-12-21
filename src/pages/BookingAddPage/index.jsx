import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import Swal from "sweetalert2";
import api from "../../lib/httpHandler";
import "./BookingAddPage.css";
import AddNewIcon from "../../assets/icons/addnew.svg";

const BookingAddPage = () => {
	const navigate = useNavigate();
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);

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
	
	// State for trip details display
	const [tripDetails, setTripDetails] = useState({
		departureDate: '',
		returnDate: '',
		pickUpTime: '',
		pickUpLocation: '',
		price: '',
		availableSeats: 0
	});

	useEffect(() => {
		setTitle("Add New Booking");
		setSubtitle("Create a new tour booking");
	}, [setTitle, setSubtitle]);

	// Create empty traveler object
	function createEmptyTraveler() {
		return {
			fullName: "",
			gender: "M",
			dateOfBirth: "",
			identityDoc: "",
			email: "",
			phoneNumber: "",
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
				console.log("Trips response:", response.data);
				const allTrips = response.data.data || [];
				const openTrips = allTrips.filter(
					(trip) => trip.status === "SCHEDULED" && (trip.availableSeats || 0) > 0
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
				console.log("Customers response:", response.data);
				setCustomers(response.data.data?.items || []);
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
				setTravelers([...travelers, createEmptyTraveler()]);
			} else {
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
			const newTravelers = [...travelers];
			newTravelers[index] = createEmptyTraveler();
			setTravelers(newTravelers);
		} else {
			const newTravelers = [...travelers];
			newTravelers[index] = {
				fullName: customer.fullName,
				gender: customer.gender || "M",
				dateOfBirth: customer.birthday || "",
				identityDoc: customer.identityDoc || "",
				email: customer.email || "",
				phoneNumber: customer.phoneNumber || customer.identityDoc || "",
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

		// Validate passengers count vs available seats
		const selectedTripData = trips.find(t => t.id === selectedTrip);
		if (selectedTripData && passengerCount > selectedTripData.availableSeats) {
			newErrors.passengers = `Number of passengers (${passengerCount}) cannot exceed available seats (${selectedTripData.availableSeats})`;
		}

		// Booking always belongs to a customer (payer)
		if (!selectedCustomer) {
			newErrors.customer = "Please select a customer";
		}

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

			const requestData = {
				tripId: selectedTrip,
				userId: selectedCustomer.id,
				noAdults: passengerCount,
				noChildren: 0,
				travelers: travelers.map((t) => ({
					fullName: t.fullName,
					gender: t.gender || null,
					dateOfBirth: t.dateOfBirth ? t.dateOfBirth : null,
					identityDoc: t.identityDoc || null,
					email: t.email?.trim() || null,
					phoneNumber: t.phoneNumber?.trim() || null,
				})),
			};

			await api.post("/api/v1/tour-bookings", requestData);

			await Swal.fire({
				icon: "success",
				title: "Success",
				text: "Booking has been created successfully",
				confirmButtonColor: "#4D40CA",
			});

			navigate("/bookings");
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
		<div className="booking-add-page">
			<div className="booking-add-container">
				{/* Close Button */}
				<button className="booking-add-close" onClick={() => navigate("/bookings")}>
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
				<h2 className="booking-add-title">
					<img src={AddNewIcon} alt="Add new" className="booking-add-title-icon" />
					Add new booking
				</h2>

				{/* Body */}
				<div className="booking-add-body">
					{/* Trip Information Card */}
					<div className="booking-section">
						<h3 className="booking-section-title">Trip Information</h3>
						<div className="booking-form-group" style={{ width: "100%", marginBottom: "28px" }}>
							<label>
								Select Trip <span className="required">*</span>
							</label>
							<select 
								value={selectedTrip} 
								onChange={(e) => {
									const tripId = e.target.value;
									setSelectedTrip(tripId);
									// Auto-fill trip details
									if (tripId) {
										const trip = trips.find(t => t.id === tripId);
										if (trip) {
											setTripDetails({
												departureDate: new Date(trip.departureDate).toLocaleDateString('en-GB'),
												returnDate: new Date(trip.returnDate).toLocaleDateString('en-GB'),
												pickUpTime: trip.pickUpTime || 'N/A',
												pickUpLocation: trip.pickUpLocation || 'N/A',
												price: trip.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(trip.price) : 'N/A',
												availableSeats: trip.availableSeats || 0
											});
										}
									} else {
										setTripDetails({
											departureDate: '',
											returnDate: '',
											pickUpTime: '',
											pickUpLocation: '',
											price: '',
											availableSeats: 0
										});
									}
								}} 
								disabled={loadingTrips}
								style={{ width: "100%" }}
							>
								<option value="">-- Select a trip --</option>
								{trips.map((trip) => (
									<option key={trip.id} value={trip.id}>
										{trip.routeName} - {new Date(trip.departureDate).toLocaleDateString("en-GB")} ({trip.availableSeats} seats
										available)
									</option>
								))}
							</select>
							{errors.trip && <span className="error-text">{errors.trip}</span>}
						</div>
						
						<div className="trip-info-grid">
							<div className="booking-form-group">
								<label>Departure Date</label>
								<input type="text" value={tripDetails.departureDate} placeholder="Departure date" readOnly />
							</div>
							<div className="booking-form-group">
								<label>Return Date</label>
								<input type="text" value={tripDetails.returnDate} placeholder="Return date" readOnly />
							</div>
							<div className="booking-form-group">
								<label>Pick-up Time</label>
								<input type="text" value={tripDetails.pickUpTime} placeholder="Pick-up time" readOnly />
							</div>
							<div className="booking-form-group">
								<label>Pick-up Location</label>
								<input type="text" value={tripDetails.pickUpLocation} placeholder="Pick-up location" readOnly />
							</div>
							<div className="booking-form-group">
								<label>Price (per person)</label>
								<input type="text" value={tripDetails.price} placeholder="Price" readOnly />
							</div>
							<div className="booking-form-group">
								<label>Available Seats</label>
								<input type="text" value={tripDetails.availableSeats || ''} placeholder="Total seats" readOnly />
							</div>
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
										className={`customer-select-btn ${showCustomerDropdown ? "open" : ""}`}
										onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
									>
										<span>{selectedCustomer?.fullName || "Full Name"}</span>
										<svg viewBox="0 0 24 24" fill="none">
											<path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
										</svg>
									</button>
									{showCustomerDropdown && (
										<div className="customer-dropdown">
											{loadingCustomers ? (
												<div className="customer-dropdown-item">Loading...</div>
											) : customers.length === 0 ? (
												<div className="customer-dropdown-item">No customers found</div>
											) : (
												customers.map((customer) => (
													<div
														key={customer.id}
														className={`customer-dropdown-item ${selectedCustomer?.id === customer.id ? "selected" : ""}`}
														onClick={() => handleCustomerSelect(customer)}
													>
														{customer.fullName}
													</div>
												))
											)}
										</div>
									)}
								</div>
								{errors.customer && <span className="error-text">{errors.customer}</span>}
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
								<input type="text" value={selectedCustomer?.birthday || "Date of Birth"} readOnly />
							</div>

							{/* Email - Read Only */}
							<div className="booking-form-group email">
								<label>Email</label>
								<input type="text" value={selectedCustomer?.email || "Email"} readOnly />
							</div>

							{/* Phone - Read Only */}
							<div className="booking-form-group phone">
								<label>Phone Number</label>
								<input type="text" value={selectedCustomer?.phoneNumber || "Phone Number"} readOnly />
							</div>

							{/* Address - Read Only */}
							<div className="booking-form-group address">
								<label>Address</label>
								<input type="text" value={selectedCustomer?.address || "Address"} readOnly />
							</div>
						</div>
					</div>

					{/* Passenger Section */}
					<div className="booking-section">
						{/* Passenger Count */}
						<div className="passenger-count-section">
							<span className="passenger-count-label">Number of Passengers:</span>
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
									disabled={passengerCount >= 10 || (selectedTripInfo && passengerCount >= selectedTripInfo.availableSeats)}
								>
									+
								</button>
							</div>
						</div>
						{errors.passengers && <span className="error-text">{errors.passengers}</span>}

						<h3 className="booking-section-title">Traveler Information</h3>

						{/* Travelers */}
						{travelers.map((traveler, index) => (
							<div key={index} className="traveler-section">
								<div className="traveler-title">Traveler {index + 1} Information:</div>
								<div className="traveler-row">
									{/* Name with dropdown */}
									<div className="booking-form-group name-field">
										<label className="label-required">Full Name:</label>
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
													{customers.map((customer) => (
														<div
															key={customer.id}
															className="traveler-dropdown-item"
															onClick={() => handleTravelerSelect(index, customer)}
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
												onChange={(e) => handleTravelerChange(index, "fullName", e.target.value)}
												placeholder="Enter full name"
												style={{ marginTop: "8px" }}
											/>
										)}
										{errors[`traveler_${index}_name`] && <span className="error-text">{errors[`traveler_${index}_name`]}</span>}
									</div>

									{/* Email */}
									<div className="booking-form-group">
										<label className="label-required">Email</label>
										<input
											type="email"
											placeholder="Example@gmail.com"
											value={traveler.email || ""}
											onChange={(e) => handleTravelerChange(index, "email", e.target.value)}
											readOnly={traveler.isFromDropdown}
										/>
										{errors[`traveler_${index}_email`] && (
											<span className="error-text">{errors[`traveler_${index}_email`]}</span>
										)}
									</div>

									{/* Phone */}
									<div className="booking-form-group phone-field">
										<label>Phone Number</label>
										<input
											type="text"
											placeholder="Phone Number"
											value={traveler.phoneNumber || traveler.identityDoc || ""}
											onChange={(e) => handleTravelerChange(index, "phoneNumber", e.target.value)}
											readOnly={traveler.isFromDropdown}
										/>
										{errors[`traveler_${index}_phone`] && (
											<span className="error-text">{errors[`traveler_${index}_phone`]}</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="booking-add-footer">
					<button type="button" className="btn-booking-cancel" onClick={() => navigate("/bookings")}>
						Cancel
					</button>
					<button type="button" className="btn-booking-confirm" onClick={handleSubmit} disabled={loading}>
						{loading ? "Processing..." : "Confirm"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BookingAddPage;
