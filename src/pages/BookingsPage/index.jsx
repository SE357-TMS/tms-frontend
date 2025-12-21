import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import "./BookingsPage.css";
import api from "../../lib/httpHandler";
import BookingDetailModal from "./BookingDetailModal";
import viewIcon from "../../assets/icons/view.svg";

const BookingsPage = () => {
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);
	const navigate = useNavigate();

	// State for bookings list
	const [bookingsList, setBookingsList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Pagination & Filter states
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Modal states
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [showDetailModal, setShowDetailModal] = useState(false);

	// Set page title
	useEffect(() => {
		setTitle("Booking Management");
		setSubtitle("All tour booking information");
	}, [setTitle, setSubtitle]);

	// Fetch bookings list
	const fetchBookings = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage + 1, // Backend uses 1-based pagination
				pageSize: pageSize,
				sortBy: "createdAt",
				sortDirection: "desc",
			};

			if (statusFilter) params.status = statusFilter;
			if (searchKeyword) params.keyword = searchKeyword; // Use backend search

			const response = await api.get("/api/v1/tour-bookings", { params });
			const { content, totalPages: total, items } = response.data.data;

			// Backend returns items (not content) in PaginationResponse
			setBookingsList(items || content || []);
			setTotalPages(total || 0);
			setError(null);
		} catch (err) {
			console.error("Error fetching bookings:", err);
			setError("Unable to load bookings list");
		} finally {
			setLoading(false);
		}
	}, [currentPage, pageSize, statusFilter, searchKeyword]);

	useEffect(() => {
		fetchBookings();
	}, [fetchBookings]);

	// Handle view details
	const handleViewDetails = async (bookingId) => {
		// Navigate to booking detail page instead of modal
		navigate(`/bookings/${bookingId}`);
	};

	// Handle edit booking (only for pre-departure)
	const handleEditBooking = async (booking) => {
		// Check if trip has not departed yet
		const departureDate = new Date(booking.departureDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (departureDate <= today) {
			Swal.fire({
				icon: "warning",
				title: "Cannot edit",
				text: "Only bookings for trips that have not yet departed can be edited",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		if (booking.status === "CANCELED" || booking.status === "COMPLETED") {
			Swal.fire({
				icon: "warning",
				title: "Cannot edit",
				text: "Cannot edit a canceled or completed booking",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		// Rule: allow traveler edits if UNPAID or departure is > 3 days away
		const daysToDeparture = Math.floor((departureDate - today) / (1000 * 60 * 60 * 24));
		const isUnpaid = booking.invoice?.paymentStatus === "UNPAID";
		if (!isUnpaid && daysToDeparture <= 3) {
			Swal.fire({
				icon: "warning",
				title: "Cannot edit",
				text: "Only unpaid bookings or trips departing in more than 3 days can edit travelers",
				confirmButtonColor: "#4D40CA",
			});
			return;
		}

		// Navigate to edit page instead of modal
		navigate(`/bookings/${booking.id}/edit`);
	};

	// Handle cancel booking
	const handleCancelBooking = async (bookingId) => {
		const result = await Swal.fire({
			title: "Cancel booking",
			text: "Are you sure you want to cancel this booking?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Cancel booking",
			cancelButtonText: "Close",
		});

		if (result.isConfirmed) {
			try {
				await api.post(`/api/v1/tour-bookings/${bookingId}/cancel`);
				Swal.fire({
					icon: "success",
					title: "Canceled",
					text: "Booking has been canceled successfully",
					confirmButtonColor: "#4D40CA",
				});
				fetchBookings();
			} catch (err) {
				console.error("Error canceling booking:", err);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: err.response?.data?.message || "Could not cancel booking",
					confirmButtonColor: "#4D40CA",
				});
			}
		}
	};

	// Search handler
	const handleSearch = (e) => {
		setSearchKeyword(e.target.value);
		setCurrentPage(0);
	};

	// Filter handler
	const handleStatusFilterChange = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(0);
	};

	// Pagination handlers
	const goToPage = (page) => {
		if (page >= 0 && page < totalPages) {
			setCurrentPage(page);
		}
	};

	const handlePageSizeChange = (e) => {
		setPageSize(Number(e.target.value));
		setCurrentPage(0);
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
			minimumFractionDigits: 0,
		}).format(price);
	};

	// Get status class
	const getStatusClass = (status) => {
		switch (status) {
			case "PENDING":
				return "pending";
			case "CONFIRMED":
				return "confirmed";
			case "CANCELED":
				return "cancelled";
			case "COMPLETED":
				return "completed";
			default:
				return "";
		}
	};

	// Get status text
	const getStatusText = (status) => {
		switch (status) {
			case "PENDING":
				return "Pending";
			case "CONFIRMED":
				return "Confirmed";
			case "CANCELED":
				return "Canceled";
			case "COMPLETED":
				return "Completed";
			default:
				return status;
		}
	};

	// Check if booking can be edited
	const canEditBooking = (booking) => {
		if (booking.status === "CANCELED" || booking.status === "COMPLETED") {
			return false;
		}
		const departureDate = new Date(booking.departureDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return departureDate > today;
	};

	// Check if booking can be cancelled
	const canCancelBooking = (booking) => {
		return booking.status !== "CANCELED" && booking.status !== "COMPLETED";
	};

	return (
		<div className="bookings-page">
			{/* Row 1: Search, Filters and Add Button */}
			<div className="bookings-row-1">
				<div className="bookings-filters">
					<div className="bookings-search">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
						<input
							type="text"
							placeholder="Search by customer, email, tour..."
							value={searchKeyword}
							onChange={handleSearch}
						/>
					</div>

					<select
						className="bookings-filter-select"
						value={statusFilter}
						onChange={handleStatusFilterChange}
					>
						<option value="">All Status</option>
						<option value="PENDING">Pending</option>
						<option value="CONFIRMED">Confirmed</option>
						<option value="CANCELED">Canceled</option>
						<option value="COMPLETED">Completed</option>
					</select>
				</div>

				<button
					className="btn-add-booking"
					onClick={() => navigate("/bookings/new")}
				>
					<svg width="25" height="25" viewBox="0 0 25 25" fill="none">
						<path
							d="M12.25 7.25V17.25M7.25 12.25H17.25M7 23.5H17.5C19.6002 23.5 20.6503 23.5 21.4525 23.0913C22.1581 22.7317 22.7317 22.1581 23.0913 21.4525C23.5 20.6503 23.5 19.6002 23.5 17.5V7C23.5 4.8998 23.5 3.8497 23.0913 3.04754C22.7317 2.34193 22.1581 1.76825 21.4525 1.40873C20.6503 1 19.6002 1 17.5 1H7C4.8998 1 3.8497 1 3.04754 1.40873C2.34193 1.76825 1.76825 2.34193 1.40873 3.04754C1 3.8497 1 4.8998 1 7V17.5C1 19.6002 1 20.6503 1.40873 21.4525C1.76825 22.1581 2.34193 22.7317 3.04754 23.0913C3.8497 23.5 4.8998 23.5 7 23.5Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Add Booking
				</button>
			</div>

			{/* Row 2: Table */}
			<div className="bookings-table-wrapper">
				<div className="bookings-table-container">
					<table className="bookings-table">
						<thead>
							<tr>
								<th>Customer</th>
								<th>Total Price</th>
								<th>Tour</th>
								<th>Booking Date</th>
								<th>Guests</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="7" className="table-loading">
										<div className="spinner"></div>
										Loading...
									</td>
								</tr>
							) : error ? (
								<tr>
									<td colSpan="7" className="table-error">
										{error}
									</td>
								</tr>
							) : bookingsList.length === 0 ? (
								<tr>
									<td colSpan="7" className="table-empty">
										No bookings found
									</td>
								</tr>
							) : (
								bookingsList.map((booking) => (
									<tr key={booking.id}>
										<td>
											<div className="customer-info">
												<span className="customer-name">
													{booking.userName || "N/A"}
												</span>
												<span className="customer-email">
													{booking.userEmail || "N/A"}
												</span>
											</div>
										</td>
										<td className="booking-price">
											{formatPrice(booking.totalPrice)}
										</td>
										<td>
											<div className="booking-info">
												<span className="booking-route">
													{booking.routeName || "N/A"}
												</span>
												<span className="booking-dates">
													{formatDate(booking.departureDate)} -{" "}
													{formatDate(booking.returnDate)}
												</span>
											</div>
										</td>
										<td>{formatDate(booking.createdAt)}</td>
										<td>{booking.seatsBooked || 0}</td>
										<td>
											<span
												className={`status-badge ${getStatusClass(
													booking.status
												)}`}
											>
												{getStatusText(booking.status)}
											</span>
										</td>
										<td>
											<div className="action-buttons">
												<button
													className="btn-view"
													onClick={() => handleViewDetails(booking.id)}
													title="View details"
												>
													<img src={viewIcon} alt="View" />
												</button>
												{canEditBooking(booking) && (
													<button
														className="btn-edit"
														onClick={() => handleEditBooking(booking)}
														title="Edit"
													>
														<svg
															width="18"
															height="18"
															viewBox="0 0 18 18"
															fill="none"
														>
															<path
																d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12.75 3L15 5.25L4.5 15.75L1.5 16.5Z"
																stroke="currentColor"
																strokeWidth="1.5"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													</button>
												)}
												{canCancelBooking(booking) && (
													<button
														className="btn-cancel-booking"
														onClick={() => handleCancelBooking(booking.id)}
														title="Cancel booking"
													>
														<svg
															width="18"
															height="18"
															viewBox="0 0 18 18"
															fill="none"
														>
															<path
																d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5"
																stroke="currentColor"
																strokeWidth="1.5"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													</button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="bookings-pagination-wrapper">
					<div className="pagination-info">
						<span>Show</span>
						<select
							value={pageSize}
							onChange={handlePageSizeChange}
							className="page-size-select"
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={15}>15</option>
							<option value={20}>20</option>
						</select>
						<span>results</span>
					</div>

					<div className="bookings-pagination">
						<button
							onClick={() => goToPage(0)}
							disabled={currentPage === 0 || totalPages === 0}
							className="pagination-btn"
						>
							«
						</button>
						<button
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage === 0 || totalPages === 0}
							className="pagination-btn"
						>
							‹
						</button>

						{totalPages > 0 ? (
							[...Array(Math.min(totalPages, 5))].map((_, index) => {
								let pageNum = index;
								if (totalPages > 5) {
									if (currentPage < 3) {
										pageNum = index;
									} else if (currentPage > totalPages - 3) {
										pageNum = totalPages - 5 + index;
									} else {
										pageNum = currentPage - 2 + index;
									}
								}
								return (
									<button
										key={pageNum}
										onClick={() => goToPage(pageNum)}
										className={`pagination-btn ${
											currentPage === pageNum ? "active" : ""
										}`}
									>
										{pageNum + 1}
									</button>
								);
							})
						) : (
							<button className="pagination-btn active">1</button>
						)}

						<button
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage === totalPages - 1 || totalPages === 0}
							className="pagination-btn"
						>
							›
						</button>
						<button
							onClick={() => goToPage(totalPages - 1)}
							disabled={currentPage === totalPages - 1 || totalPages === 0}
							className="pagination-btn"
						>
							»
						</button>
					</div>
				</div>
			</div>

			{/* Modals */}
			{showDetailModal && selectedBooking && (
				<BookingDetailModal
					booking={selectedBooking}
					onClose={() => setShowDetailModal(false)}
					onEdit={() => handleEditBooking(selectedBooking)}
					canEdit={canEditBooking(selectedBooking)}
				/>
			)}
		</div>
	);
};

export default BookingsPage;
