import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './StaffPage.css';
import api from '../../lib/httpHandler';
import StaffDetailModal from './StaffDetailModal';
import StaffEditModal from './StaffEditModal';
import StaffAddModal from './StaffAddModal';
import bellIcon from '../../assets/icons/bellring.svg';
import viewIcon from '../../assets/icons/view.svg';

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [genderFilter] = useState('');
  const [statusFilter] = useState('');
  
  // Modal states
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
      const { content, totalPages: total } = response.data.data;
      
      setStaffList(content);
      setTotalPages(total);
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

  // Handle toggle lock
  const handleToggleLock = async (staffId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Update lock status?',
      text: 'This will immediately change the staff account status.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, update'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await api.patch(`/admin/staffs/${staffId}/toggle-lock`);
      fetchStaffList();
      Swal.fire({
        icon: 'success',
        title: 'Lock status updated',
        confirmButtonColor: '#4D40CA'
      });
    } catch (err) {
      console.error('Error toggling lock:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to update lock status',
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

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="staff-page">
      {/* Row 1: Title and User Profile */}
      <div className="staff-row-1">
        <div className="staff-title">
          <h1>All Staffs</h1>
          <p>Information on all staffs</p>
        </div>
        <div className="staff-right-actions">
          <button className="btn-notification" aria-label="Notifications">
            <img src={bellIcon} alt="Notifications" />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/150?img=12" alt="User" />
            </div>
            <div className="user-info">
              <div className="user-name">Đặng Phú Thiện</div>
              <div className="user-role">Administrator</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: Search and Add Button */}
      <div className="staff-row-2">
        <div className="staff-search">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchKeyword}
            onChange={handleSearch}
          />
        </div>
        <button className="btn-add-staff" onClick={() => setShowAddModal(true)}>
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M12.25 7.25V17.25M7.25 12.25H17.25M7 23.5H17.5C19.6002 23.5 20.6503 23.5 21.4525 23.0913C22.1581 22.7317 22.7317 22.1581 23.0913 21.4525C23.5 20.6503 23.5 19.6002 23.5 17.5V7C23.5 4.8998 23.5 3.8497 23.0913 3.04754C22.7317 2.34193 22.1581 1.76825 21.4525 1.40873C20.6503 1 19.6002 1 17.5 1H7C4.8998 1 3.8497 1 3.04754 1.40873C2.34193 1.76825 1.76825 2.34193 1.40873 3.04754C1 3.8497 1 4.8998 1 7V17.5C1 19.6002 1 20.6503 1.40873 21.4525C1.76825 22.1581 2.34193 22.7317 3.04754 23.0913C3.8497 23.5 4.8998 23.5 7 23.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add New Staff
        </button>
      </div>

      {/* Row 3: Table */}
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
                  <td>{staff.gender === 'M' ? 'Male' : staff.gender === 'F' ? 'Female' : 'Other'}</td>
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

        {/* Pagination */}
        {totalPages > 1 && (
        <div className="staff-pagination">
          <button 
            onClick={() => goToPage(0)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            «
          </button>
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            ‹
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`pagination-btn ${currentPage === index ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="pagination-btn"
          >
            ›
          </button>
          <button 
            onClick={() => goToPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="pagination-btn"
          >
            »
          </button>
        </div>
      )}
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
          onToggleLock={() => {
            handleToggleLock(selectedStaff.id);
            setShowDetailModal(false);
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
