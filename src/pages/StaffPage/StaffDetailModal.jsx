import React from 'react';
import './StaffModal.css';
import closeIcon from '../../assets/icons/close.svg';
import modifyIcon from '../../assets/icons/modify.svg';

const StaffDetailModal = ({ staff, onClose, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return 'N/A';
    switch (gender.toUpperCase()) {
      case 'MALE': return 'Male';
      case 'FEMALE': return 'Female';
      case 'OTHER': return 'Other';
      default: return gender;
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container staff-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C12.7614 11 15 8.76142 15 6C15 3.23858 12.7614 1 10 1C7.23858 1 5 3.23858 5 6C5 8.76142 7.23858 11 10 11Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M1 19C1 15.134 4.58172 12 9 12H11C15.4183 12 19 15.134 19 19" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2>Staff Information</h2>
            <button className="btn-edit-icon" onClick={onEdit} title="Edit Staff">
              <img src={modifyIcon} alt="Edit" />
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Avatar */}
          <div className="staff-detail-avatar">
            {staff.avatarUrl ? (
              <img src={staff.avatarUrl} alt={staff.fullName} />
            ) : (
              <div className="detail-avatar-placeholder">
                {staff.fullName?.charAt(0) || 'S'}
              </div>
            )}
          </div>

          {/* Information Grid */}
          <div className="staff-detail-grid">
            <div className="detail-field">
              <label>Full Name</label>
              <p>{staff.fullName || 'N/A'}</p>
            </div>

            <div className="detail-field-row">
              <div className="detail-field">
                <label>Gender</label>
                <p>{getGenderDisplay(staff.gender)}</p>
              </div>
              <div className="detail-field">
                <label>Birthday</label>
                <p>{formatDate(staff.birthday)}</p>
              </div>
            </div>

            <div className="detail-field">
              <label>Address</label>
              <p>{staff.address || 'N/A'}</p>
            </div>

            <div className="detail-field">
              <label>Phone Number</label>
              <p>{staff.phoneNumber || 'N/A'}</p>
            </div>

            <div className="detail-field">
              <label>Email</label>
              <p>{staff.email || 'N/A'}</p>
            </div>

            <div className="detail-field">
              <label>Status</label>
              <span className={`status-badge ${staff.isLock ? 'locked' : 'active'}`}>
                {staff.isLock ? 'Locked' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;
