import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './StaffModal.css';
import api from '../../lib/httpHandler';
import closeIcon from '../../assets/icons/close.svg';

const StaffEditModal = ({ staff, onClose, onSave }) => {
  // Map gender: M -> MALE, F -> FEMALE, O -> OTHER
  const mapGenderToFrontend = (gender) => {
    if (gender === 'M') return 'MALE';
    if (gender === 'F') return 'FEMALE';
    if (gender === 'O') return 'OTHER';
    return 'MALE';
  };
  
  const [formData, setFormData] = useState({
    fullName: staff.fullName || '',
    gender: mapGenderToFrontend(staff.gender),
    birthday: staff.birthday ? staff.birthday.split('T')[0] : '',
    address: staff.address || '',
    phoneNumber: staff.phoneNumber || '',
    email: staff.email || '',
    isLock: staff.isLock || false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Map gender: MALE -> M, FEMALE -> F, OTHER -> O
      const dataToSend = {
        ...formData,
        gender: formData.gender === 'MALE' ? 'M' : formData.gender === 'FEMALE' ? 'F' : 'O'
      };
      
      // Gửi JSON data (backend không support avatar upload qua API này)
      await api.put(`/admin/staffs/${staff.id}`, dataToSend);
      
      await Swal.fire({
        icon: 'success',
        title: 'Staff updated successfully',
        confirmButtonColor: '#4D40CA'
      });
      onSave();
    } catch (err) {
      console.error('Error updating staff:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Failed to update staff',
        text: err.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#4D40CA'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container staff-edit-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14 2L18 6M2 18L2.5 15.5L13.5 4.5L16.5 7.5L5.5 18.5L2 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Edit Staff</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Avatar Display */}
            <div className="staff-edit-avatar">
              {staff.avatarUrl ? (
                <img src={staff.avatarUrl} alt={staff.fullName} />
              ) : (
                <div className="edit-avatar-placeholder">
                  {formData.fullName?.charAt(0) || 'S'}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender <span className="required">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Account Status</label>
              <select
                name="isLock"
                value={formData.isLock}
                onChange={(e) => setFormData(prev => ({ ...prev, isLock: e.target.value === 'true' }))}
              >
                <option value="false">Active</option>
                <option value="true">Locked</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEditModal;
