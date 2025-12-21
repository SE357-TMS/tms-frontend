import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import "./InvoicesPage.css";
import api from "../../lib/httpHandler";
import viewIcon from "../../assets/icons/view.svg";

const InvoicesPage = () => {
	const { setTitle, setSubtitle } = useContext(AdminTitleContext);
	const navigate = useNavigate();

	const [invoices, setInvoices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	useEffect(() => {
		setTitle("Invoice Management");
		setSubtitle("All invoice information");
	}, [setTitle, setSubtitle]);

	useEffect(() => {
		fetchInvoices();
	}, [currentPage, pageSize, statusFilter, searchTerm]);

	const fetchInvoices = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage + 1, // Backend uses 1-based pagination
				pageSize: pageSize,
				sortBy: "createdAt",
				sortDirection: "desc",
			};
			if (statusFilter) params.paymentStatus = statusFilter;
			if (searchTerm) params.search = searchTerm;

			const response = await api.get("/api/v1/invoices", { params });
			setInvoices(response.data.data.items || response.data.data.content || []);
			setTotalPages(response.data.data.totalPages || 0);
			setError(null);
		} catch (err) {
			console.error("Error fetching invoices:", err);
			setError("Unable to load invoices list");
		} finally {
			setLoading(false);
		}
	};

	const handleViewDetails = (invoiceId) => {
		navigate(`/invoices/${invoiceId}`);
	};

	const handleDeleteInvoice = async (invoiceId) => {
		const result = await Swal.fire({
			title: "Delete Invoice",
			text: "Are you sure you want to delete this invoice?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#4D40CA",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, delete it",
			cancelButtonText: "Cancel",
		});

		if (result.isConfirmed) {
			try {
				await api.delete(`/api/v1/invoices/${invoiceId}`);
				Swal.fire({
					icon: "success",
					title: "Deleted!",
					text: "Invoice has been deleted",
					confirmButtonColor: "#4D40CA",
					timer: 2000,
				});
				fetchInvoices();
			} catch (error) {
				Swal.fire({
					icon: "error",
					title: "Error",
					text: "Could not delete invoice",
					confirmButtonColor: "#4D40CA",
				});
			}
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB");
	};

	const formatPrice = (price) => {
		if (!price) return "0 ₫";
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const getStatusClass = (status) => {
		switch (status) {
			case "PAID":
				return "confirmed";
			case "REFUNDED":
				return "completed";
			case "UNPAID":
				return "pending";
			default:
				return "";
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case "PAID":
				return "Paid";
			case "REFUNDED":
				return "Refunded";
			case "UNPAID":
				return "Waiting";
			default:
				return status;
		}
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(0);
	};

	const handleStatusFilterChange = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(0);
	};

	const goToPage = (page) => {
		if (page >= 0 && page < totalPages) {
			setCurrentPage(page);
		}
	};

	const handlePageSizeChange = (e) => {
		setPageSize(Number(e.target.value));
		setCurrentPage(0);
	};

	return (
		<div className="invoices-page">
			{/* Row 1: Search and Filters */}
			<div className="invoices-row-1">
				<div className="invoices-filters">
					<div className="invoices-search">
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
							value={searchTerm}
							onChange={handleSearch}
						/>
					</div>

					<select
						className="invoices-filter-select"
						value={statusFilter}
						onChange={handleStatusFilterChange}
					>
						<option value="">All Status</option>
						<option value="PAID">Paid</option>
						<option value="UNPAID">Pending</option>
						<option value="REFUNDED">Refunded</option>
					</select>
				</div>
			</div>

			{/* Row 2: Table */}
			<div className="invoices-table-wrapper">
				<div className="invoices-table-container">
					<table className="invoices-table">
						<thead>
							<tr>
								<th>Customer</th>
								<th>Order Code</th>
								<th>Creation Date</th>
								<th>Tour</th>
								<th>Total Amount</th>
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
							) : invoices.length === 0 ? (
								<tr>
									<td colSpan="7" className="table-empty">
										No invoices found
									</td>
								</tr>
							) : (
								invoices.map((invoice) => (
									<tr key={invoice.id}>
										<td>
											<div className="customer-info">
												<span className="customer-name">
													{invoice.userName || "N/A"}
												</span>
												<span className="customer-email">
													{invoice.userEmail || "N/A"}
												</span>
											</div>
										</td>
										<td>{invoice.invoiceCode || "N/A"}</td>
										<td>{formatDate(invoice.createdAt)}</td>
										<td>
											<div className="invoice-info">
												<span className="invoice-route">
													{invoice.routeName || "N/A"}
												</span>
												<span className="invoice-dates">
													{formatDate(invoice.departureDate)} -{" "}
													{formatDate(invoice.returnDate)}
												</span>
											</div>
										</td>
										<td className="invoice-price">
											{formatPrice(invoice.totalAmount)}
										</td>
										<td>
											<span
												className={`status-badge ${getStatusClass(
													invoice.paymentStatus
												)}`}
											>
												{getStatusText(invoice.paymentStatus)}
											</span>
										</td>
										<td>
											<div className="action-buttons">
												<button
													className="btn-view"
													onClick={() => handleViewDetails(invoice.id)}
													title="View details"
												>
													<img src={viewIcon} alt="View" />
												</button>
												<button
													className="btn-cancel-invoice"
													onClick={() => handleDeleteInvoice(invoice.id)}
													title="Delete"
												>
													<svg
														width="18"
														height="18"
														viewBox="0 0 18 18"
														fill="none"
													>
														<path
															d="M2 5H16M7 8V13M11 8V13M3 5L4 15C4 15.5304 4.21071 16.0391 4.58579 16.4142C4.96086 16.7893 5.46957 17 6 17H12C12.5304 17 13.0391 16.7893 13.4142 16.4142C13.7893 16.0391 14 15.5304 14 15L15 5M6 5V3C6 2.73478 6.10536 2.48043 6.29289 2.29289C6.48043 2.10536 6.73478 2 7 2H11C11.2652 2 11.5196 2.10536 11.7071 2.29289C11.8946 2.48043 12 2.73478 12 3V5"
															stroke="currentColor"
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{!loading && !error && invoices.length > 0 && (
					<div className="invoices-pagination-wrapper">
						<div className="pagination-info">
							<span>Show</span>
							<select
								className="page-size-select"
								value={pageSize}
								onChange={handlePageSizeChange}
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
							<span>entries</span>
						</div>

						<div className="invoices-pagination">
							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 0}
							>
								Previous
							</button>

							{[...Array(totalPages)].map((_, index) => (
								<button
									key={index}
									className={`pagination-btn ${
										currentPage === index ? "active" : ""
									}`}
									onClick={() => goToPage(index)}
								>
									{index + 1}
								</button>
							))}

							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages - 1}
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default InvoicesPage;
