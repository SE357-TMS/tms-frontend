import React, { useState } from "react";
import Swal from "sweetalert2";
import "./BookingModal.css";
import api from "../../lib/httpHandler";

const BookingDetailModal = ({ booking, onClose, onEdit, canEdit }) => {
	const [invoiceLoading, setInvoiceLoading] = useState(false);
	const [invoiceDetails, setInvoiceDetails] = useState(null);
	const [showInvoice, setShowInvoice] = useState(false);

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

	// Format datetime
	const formatDateTime = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleString("vi-VN");
	};

	// Get status text
	const getStatusText = (status) => {
		switch (status) {
			case "PENDING":
				return "Chờ xác nhận";
			case "CONFIRMED":
				return "Đã xác nhận";
			case "CANCELED":
				return "Đã hủy";
			case "COMPLETED":
				return "Hoàn thành";
			default:
				return status;
		}
	};

	// Get gender text
	const getGenderText = (gender) => {
		switch (gender) {
			case "M":
				return "Nam";
			case "F":
				return "Nữ";
			case "O":
				return "Khác";
			default:
				return gender || "N/A";
		}
	};

	// Get payment status text
	const getPaymentStatusText = (status) => {
		switch (status) {
			case "UNPAID":
				return "Chưa thanh toán";
			case "PAID":
				return "Đã thanh toán";
			case "REFUNDED":
				return "Đã hoàn tiền";
			default:
				return status || "N/A";
		}
	};

	// Handle view invoice
	const handleViewInvoice = async () => {
		if (invoiceDetails) {
			setShowInvoice(true);
			return;
		}

		try {
			setInvoiceLoading(true);
			const response = await api.get(`/api/v1/invoices/booking/${booking.id}`);
			setInvoiceDetails(response.data.data);
			setShowInvoice(true);
		} catch (err) {
			console.error("Error fetching invoice:", err);
			if (err.response?.status === 404) {
				Swal.fire({
					icon: "info",
					title: "Thông báo",
					text: "Chưa có hóa đơn cho phiếu đặt này",
					confirmButtonColor: "#4D40CA",
				});
			} else {
				Swal.fire({
					icon: "error",
					title: "Lỗi",
					text: "Không thể tải thông tin hóa đơn",
					confirmButtonColor: "#4D40CA",
				});
			}
		} finally {
			setInvoiceLoading(false);
		}
	};

	return (
		<div className="booking-modal-overlay" onClick={onClose}>
			<div
				className="booking-modal-container booking-detail-modal"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="booking-modal-header">
					<h2 className="booking-modal-title">
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Chi tiết phiếu đặt
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
					{/* Tour Information */}
					<div className="booking-section">
						<h3 className="booking-section-title">Thông tin chuyến đi</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Tên tour</label>
								<p>{booking.routeName || "N/A"}</p>
							</div>
							<div className="booking-detail-field">
								<label>Trạng thái</label>
								<p>{getStatusText(booking.status)}</p>
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
								<label>Số chỗ đặt</label>
								<p>{booking.seatsBooked || 0}</p>
							</div>
							<div className="booking-detail-field">
								<label>Tổng tiền</label>
								<p style={{ color: "#4D40CA", fontWeight: 700 }}>
									{formatPrice(booking.totalPrice)}
								</p>
							</div>
						</div>
					</div>

					{/* Customer Information */}
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
							<div className="booking-detail-field">
								<label>Số người lớn</label>
								<p>{booking.noAdults || 0}</p>
							</div>
							<div className="booking-detail-field">
								<label>Số trẻ em</label>
								<p>{booking.noChildren || 0}</p>
							</div>
						</div>
					</div>

					{/* Travelers Information */}
					{booking.travelers && booking.travelers.length > 0 && (
						<div className="booking-section">
							<h3 className="booking-section-title">Thông tin hành khách</h3>
							<div className="travelers-list">
								{booking.travelers.map((traveler, index) => (
									<div key={traveler.id || index} className="traveler-card">
										<div className="traveler-card-header">
											Hành khách {index + 1}
										</div>
										<div className="traveler-card-grid">
											<div className="traveler-card-field">
												<label>Họ tên</label>
												<p>{traveler.fullName || "N/A"}</p>
											</div>
											<div className="traveler-card-field">
												<label>Giới tính</label>
												<p>{getGenderText(traveler.gender)}</p>
											</div>
											<div className="traveler-card-field">
												<label>Ngày sinh</label>
												<p>{formatDate(traveler.dateOfBirth)}</p>
											</div>
											<div className="traveler-card-field">
												<label>CMND/CCCD</label>
												<p>{traveler.identityDoc || "N/A"}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Invoice Information */}
					{booking.invoice && (
						<div className="booking-section">
							<h3 className="booking-section-title">Thông tin hóa đơn</h3>
							<div className="booking-detail-grid">
								<div className="booking-detail-field">
									<label>Mã hóa đơn</label>
									<p>{booking.invoice.id?.substring(0, 8) || "N/A"}</p>
								</div>
								<div className="booking-detail-field">
									<label>Tổng tiền</label>
									<p>{formatPrice(booking.invoice.totalAmount)}</p>
								</div>
								<div className="booking-detail-field">
									<label>Trạng thái thanh toán</label>
									<p>{getPaymentStatusText(booking.invoice.paymentStatus)}</p>
								</div>
								<div className="booking-detail-field">
									<label>Phương thức thanh toán</label>
									<p>{booking.invoice.paymentMethod || "N/A"}</p>
								</div>
							</div>
						</div>
					)}

					{/* View Invoice Button */}
					{showInvoice && invoiceDetails && (
						<div className="booking-section">
							<h3 className="booking-section-title">Chi tiết hóa đơn</h3>
							<div className="booking-detail-grid">
								<div className="booking-detail-field">
									<label>Mã hóa đơn</label>
									<p>{invoiceDetails.id?.substring(0, 8) || "N/A"}</p>
								</div>
								<div className="booking-detail-field">
									<label>Tổng tiền</label>
									<p style={{ color: "#4D40CA", fontWeight: 700 }}>
										{formatPrice(invoiceDetails.totalAmount)}
									</p>
								</div>
								<div className="booking-detail-field">
									<label>Trạng thái thanh toán</label>
									<p>{getPaymentStatusText(invoiceDetails.paymentStatus)}</p>
								</div>
								<div className="booking-detail-field">
									<label>Phương thức thanh toán</label>
									<p>{invoiceDetails.paymentMethod || "N/A"}</p>
								</div>
								<div className="booking-detail-field">
									<label>Ngày tạo hóa đơn</label>
									<p>{formatDateTime(invoiceDetails.createdAt)}</p>
								</div>
								<div className="booking-detail-field">
									<label>Ghi chú</label>
									<p>{invoiceDetails.notes || "Không có"}</p>
								</div>
							</div>
						</div>
					)}

					{/* Timestamps */}
					<div className="booking-section">
						<h3 className="booking-section-title">Thời gian</h3>
						<div className="booking-detail-grid">
							<div className="booking-detail-field">
								<label>Ngày tạo</label>
								<p>{formatDateTime(booking.createdAt)}</p>
							</div>
							<div className="booking-detail-field">
								<label>Cập nhật lần cuối</label>
								<p>{formatDateTime(booking.updatedAt)}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="booking-modal-footer">
					<button
						type="button"
						className="btn-booking-cancel"
						onClick={onClose}
					>
						Đóng
					</button>
					{!showInvoice && (
						<button
							type="button"
							className="btn-booking-confirm"
							onClick={handleViewInvoice}
							disabled={invoiceLoading}
							style={{
								background: "rgba(59, 130, 246, 0.1)",
								borderColor: "#3b82f6",
								color: "#3b82f6",
							}}
						>
							{invoiceLoading ? "Đang tải..." : "Xem hóa đơn"}
						</button>
					)}
					{canEdit && (
						<button
							type="button"
							className="btn-booking-confirm"
							onClick={onEdit}
						>
							Chỉnh sửa
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default BookingDetailModal;
