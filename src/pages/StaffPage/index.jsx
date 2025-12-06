import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import './StaffPage.css';
import api from '../../lib/httpHandler';
import StaffDetailModal from './StaffDetailModal';
import StaffEditModal from './StaffEditModal';
import StaffAddModal from './StaffAddModal';
import viewIcon from '../../assets/icons/view.svg';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';

const StaffPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);
  
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Set page title
  useEffect(() => {
    setTitle('All Staffs');
    setSubtitle('Information on all staffs');
  }, [setTitle, setSubtitle]);

  // Fetch staff list
  const fetchStaffList = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
        sortDirection: 'DESC',
      };
      
      if (searchKeyword) params.keyword = searchKeyword;
      if (genderFilter) params.gender = genderFilter;
      if (statusFilter !== '') params.isLock = statusFilter;
      
      const response = await api.get('/admin/staffs', { params });
      const { content, totalPages: total, totalElements } = response.data.data;
      
      setStaffList(content);
      setTotalPages(total);
      setTotalItems(totalElements || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchKeyword, genderFilter, statusFilter]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Handle view details
  const handleViewDetails = async (staffId) => {
    try {
      const response = await api.get(`/admin/staffs/${staffId}`);
      setSelectedStaff(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to load staff details',
        text: err.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#4D40CA'
      });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(0);
  };

  // Handle filter change
  const handleGenderFilterChange = (e) => {
    setGenderFilter(e.target.value);
    setCurrentPage(0);
  };

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

  return (
    <div className="staff-page">
      {/* Row 1: Search, Filters and Add Button */}
      <div className="staff-row-1">
        <div className="staff-filters">
          <div className="staff-search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchKeyword}
              onChange={handleSearch}
            />
          </div>
          
          <select 
            className="staff-filter-select"
            value={genderFilter}
            onChange={handleGenderFilterChange}
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          
          <select 
            className="staff-filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Locked</option>
          </select>
        </div>
        
        <button className="btn-add-staff" onClick={() => setShowAddModal(true)}>
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M12.25 7.25V17.25M7.25 12.25H17.25M7 23.5H17.5C19.6002 23.5 20.6503 23.5 21.4525 23.0913C22.1581 22.7317 22.7317 22.1581 23.0913 21.4525C23.5 20.6503 23.5 19.6002 23.5 17.5V7C23.5 4.8998 23.5 3.8497 23.0913 3.04754C22.7317 2.34193 22.1581 1.76825 21.4525 1.40873C20.6503 1 19.6002 1 17.5 1H7C4.8998 1 3.8497 1 3.04754 1.40873C2.34193 1.76825 1.76825 2.34193 1.40873 3.04754C1 3.8497 1 4.8998 1 7V17.5C1 19.6002 1 20.6503 1.40873 21.4525C1.76825 22.1581 2.34193 22.7317 3.04754 23.0913C3.8497 23.5 4.8998 23.5 7 23.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add New Staff
        </button>
      </div>

      {/* Row 2: Table */}
      <div className="staff-table-wrapper">
        <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Phone number</th>
              <th>Email</th>
              <th>Status</th>
              <th>View</th>
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
                <td colSpan="7" className="table-error">{error}</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No staff found</td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div className="staff-avatar">
                      {staff.avatarUrl ? (
                        <img src={staff.avatarUrl} alt={staff.fullName} />
                      ) : (
                        <div className="avatar-placeholder">
                          {staff.fullName?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="staff-name">{staff.fullName || 'N/A'}</td>
                  <td>{staff.gender === 'M' ? 'Male' : staff.gender === 'F' ? 'Female' : staff.gender === 'O' ? 'Other' : 'N/A'}</td>
                  <td>{staff.phoneNumber || 'N/A'}</td>
                  <td>{staff.email || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${staff.isLock ? 'locked' : 'active'}`}>
                      {staff.isLock ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(staff.id)}
                      aria-label="View details"
                      title="View Details"
                    >
                      <img src={viewIcon} alt="View" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination - Always visible */}
        <div className="staff-pagination-wrapper">
          <div className="pagination-info">
            <span>Show</span>
            <select value={pageSize} onChange={handlePageSizeChange} className="page-size-select">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <span>results</span>
          </div>
          
          <div className="staff-pagination">
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
              [...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`pagination-btn ${currentPage === index ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))
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
      {showDetailModal && selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {showEditModal && selectedStaff && (
        <StaffEditModal
          staff={selectedStaff}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchStaffList();
          }}
        />
      )}

      {showAddModal && (
        <StaffAddModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchStaffList();
          }}
        />
      )}
    </div>
  );
};

export default StaffPage;
