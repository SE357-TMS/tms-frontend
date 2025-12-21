import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../../lib/httpHandler";
import "./EditPassengerModal.css";

const EditPassengerModal = ({ traveler, onClose, onSave, bookingId, travelerIndex }) => {
	const [formData, setFormData] = useState({
		fullName: traveler?.fullName || "",
		email: traveler?.email || "",
		phoneNumber: traveler?.phoneNumber || "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.fullName.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Warning",
				text: "Please enter full name",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		if (!formData.email.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Warning",
				text: "Please enter email",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		if (!formData.phoneNumber.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Warning",
				text: "Please enter phone number",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		try {
			// Get booking details first
			const bookingResponse = await api.get(`/api/v1/tour-bookings/${bookingId}`);
			const booking = bookingResponse.data.data;

			// Update travelers array
			const updatedTravelers = [...booking.travelers];
			updatedTravelers[travelerIndex] = {
				...updatedTravelers[travelerIndex],
				fullName: formData.fullName,
				email: formData.email,
				phoneNumber: formData.phoneNumber,
			};

			// Send update request
			await api.put(`/api/v1/tour-bookings/${bookingId}`, {
				travelers: updatedTravelers,
			});

			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Passenger information updated successfully",
				confirmButtonColor: "#4D40CA",
			});

			onSave();
		} catch (err) {
			console.error("Error updating passenger:", err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.response?.data?.message || "Unable to update passenger information",
				confirmButtonColor: "#4D40CA",
			});
		}
	};

	return (
		<div className="edit-passenger-overlay" onClick={onClose}>
			<div className="edit-passenger-modal" onClick={(e) => e.stopPropagation()}>
				{/* Close Icon */}
				<button className="edit-passenger-close" onClick={onClose}>
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
				<h2 className="edit-passenger-title">Edit passenger information</h2>

				{/* Form */}
				<div className="edit-passenger-form">
					<div className="edit-form-row">
						<div className="edit-form-field">
							<label>Full name: *</label>
							<input
								type="text"
								name="fullName"
								value={formData.fullName}
								onChange={handleChange}
								placeholder="Full name"
							/>
						</div>

						<div className="edit-form-field">
							<label>Email *</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Example@gmail.com"
							/>
						</div>

						<div className="edit-form-field">
							<label>Phone number *</label>
							<input
								type="tel"
								name="phoneNumber"
								value={formData.phoneNumber}
								onChange={handleChange}
								placeholder="Phone number"
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="edit-form-actions">
						<button className="edit-cancel-btn" onClick={onClose}>
							Cancel
						</button>
						<button className="edit-confirm-btn" onClick={handleSubmit}>
							Confirm
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditPassengerModal;
