import React, { useState, useEffect } from 'react';
import './StaffPage.css';
import api from '../../lib/httpHandler';
import StaffDetailModal from './StaffDetailModal';
import StaffEditModal from './StaffEditModal';
import StaffAddModal from './StaffAddModal';

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
      alert('Failed to load staff details');
    }
  };

  // Handle toggle lock
  const handleToggleLock = async (staffId) => {
    if (!confirm('Are you sure you want to change the lock status of this staff?')) {
      return;
    }
    
    try {
      await api.patch(`/admin/staffs/${staffId}/toggle-lock`);
      fetchStaffList();
      alert('Staff lock status updated successfully');
    } catch (err) {
      console.error('Error toggling lock:', err);
      alert('Failed to update lock status');
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
      {/* Header */}
      <div className="staff-header">
        <div className="staff-title">
          <h1>All Staffs</h1>
          <p>Information on all staffs</p>
        </div>
        <div className="staff-header-actions">
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Staff
          </button>
        </div>
      </div>

      {/* Table */}
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
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" fill="currentColor"/>
                        <path d="M19 10C17 14 13.5 17 10 17C6.5 17 3 14 1 10C3 6 6.5 3 10 3C13.5 3 17 6 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
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
