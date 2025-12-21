import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./BookingModal.css";
import api from "../../lib/httpHandler";

const BookingEditModal = ({ booking, onClose, onSave }) => {
	// State for form data
	const [status, setStatus] = useState(booking.status || "PENDING");
	const [travelers, setTravelers] = useState([]);

	// State for submission
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// Initialize travelers from booking
	useEffect(() => {
		if (booking.travelers && booking.travelers.length > 0) {
			setTravelers(
				booking.travelers.map((t) => ({
					id: t.id,
					fullName: t.fullName || "",
					gender: t.gender || "M",
					dateOfBirth: t.dateOfBirth || "",
					identityDoc: t.identityDoc || "",
				}))
			);
		}
	}, [booking]);

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
				newErrors[`traveler_${index}_name`] = "Vui lòng nhập họ tên";
			}
			if (!traveler.dateOfBirth) {
				newErrors[`traveler_${index}_dob`] = "Vui lòng nhập ngày sinh";
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
				status: status,
				// Note: Backend may need travelers update endpoint separately
			};

			await api.put(`/api/v1/tour-bookings/${booking.id}`, requestData);

			await Swal.fire({
				icon: "success",
				title: "Thành công",
				text: "Phiếu đặt đã được cập nhật thành công",
				confirmButtonColor: "#4D40CA",
			});

			onSave();
		} catch (err) {
			console.error("Error updating booking:", err);
			await Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: err.response?.data?.message || "Không thể cập nhật phiếu đặt",
				confirmButtonColor: "#4D40CA",
			});
		} finally {
			setLoading(false);
		}
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("vi-VN");
	};

	// Format price
	const formatPrice = (price) => {
		if (!price) return "0 ₫";
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price);
	};

	return (
		<div className="booking-modal-overlay" onClick={onClose}>
			<div
				className="booking-modal-container booking-edit-modal"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="booking-modal-header">
					<h2 className="booking-modal-title">
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Chỉnh sửa phiếu đặt
					</h2>
					<button className="booking-modal-close" onClick={onClose}>
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M6 6L18 18M6 18L18 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="booking-modal-body">
					{/* Tour Information - Read Only */}
					<div className="booking-section">
						<h3 className="booking-section-title">Thông tin chuyến đi</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Tên tour</label>
								<p>{booking.routeName || "N/A"}</p>
							</div>
							<div className="booking-detail-field">
								<label>Ngày khởi hành</label>
								<p>{formatDate(booking.departureDate)}</p>
							</div>
							<div className="booking-detail-field">
								<label>Ngày về</label>
								<p>{formatDate(booking.returnDate)}</p>
							</div>
							<div className="booking-detail-field">
								<label>Tổng tiền</label>
								<p style={{ color: "#4D40CA", fontWeight: 700 }}>
									{formatPrice(booking.totalPrice)}
								</p>
							</div>
						</div>
					</div>

					{/* Customer Information - Read Only */}
					<div className="booking-section">
						<h3 className="booking-section-title">Thông tin khách hàng</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Họ và tên</label>
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
						<h3 className="booking-section-title">Cập nhật trạng thái</h3>
						<div className="booking-form-group" style={{ width: "250px" }}>
							<label>Trạng thái</label>
							<select
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								<option value="PENDING">Chờ xác nhận</option>
								<option value="CONFIRMED">Đã xác nhận</option>
								<option value="COMPLETED">Hoàn thành</option>
							</select>
						</div>
					</div>

					{/* Travelers Information - Editable */}
					{travelers.length > 0 && (
						<div className="booking-section">
							<h3 className="booking-section-title">Thông tin hành khách</h3>
							{travelers.map((traveler, index) => (
								<div key={traveler.id || index} className="traveler-section">
									<div className="traveler-title">Hành khách {index + 1}:</div>
									<div className="traveler-row">
										{/* Name */}
										<div className="booking-form-group name-field">
											<label>
												Họ tên <span className="required">*</span>
											</label>
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
												placeholder="Nhập họ tên"
											/>
											{errors[`traveler_${index}_name`] && (
												<span className="error-text">
													{errors[`traveler_${index}_name`]}
												</span>
											)}
										</div>

										{/* Gender */}
										<div className="booking-form-group">
											<label>Giới tính</label>
											<select
												value={traveler.gender}
												onChange={(e) =>
													handleTravelerChange(index, "gender", e.target.value)
												}
											>
												<option value="M">Nam</option>
												<option value="F">Nữ</option>
												<option value="O">Khác</option>
											</select>
										</div>

										{/* Date of Birth */}
										<div className="booking-form-group">
											<label>
												Ngày sinh <span className="required">*</span>
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
											/>
											{errors[`traveler_${index}_dob`] && (
												<span className="error-text">
													{errors[`traveler_${index}_dob`]}
												</span>
											)}
										</div>

										{/* Identity Doc */}
										<div className="booking-form-group">
											<label>
												CMND/CCCD <span className="required">*</span>
											</label>
											<input
												type="text"
												value={traveler.identityDoc}
												onChange={(e) =>
													handleTravelerChange(
														index,
														"identityDoc",
														e.target.value
													)
												}
												placeholder="Số CMND/CCCD"
											/>
											{errors[`traveler_${index}_doc`] && (
												<span className="error-text">
													{errors[`traveler_${index}_doc`]}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="booking-modal-footer">
					<button
						type="button"
						className="btn-booking-cancel"
						onClick={onClose}
					>
						Hủy
					</button>
					<button
						type="button"
						className="btn-booking-confirm"
						onClick={handleSubmit}
						disabled={loading}
					>
						{loading ? "Đang xử lý..." : "Lưu thay đổi"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BookingEditModal;
