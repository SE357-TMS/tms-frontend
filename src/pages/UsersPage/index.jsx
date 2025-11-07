import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import userService from '../../services/userService';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState({});

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Gọi API thực
      const data = await userService.getAllUsers();
      setUsers(data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Lỗi khi tải users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'USER'
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      role: 'USER'
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (modalMode === 'create') {
        // Gọi API tạo user
        await userService.createUser(formData);
        alert('Tạo user thành công!');
      } else {
        // Gọi API update user
        await userService.updateUser(selectedUser.id, formData);
        alert('Cập nhật user thành công!');
      }
      
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Lỗi khi lưu user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user "${username}"?`)) {
      return;
    }

    try {
      // Gọi API xóa user
      await userService.deleteUser(userId);
      alert('Xóa user thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa user: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge admin';
      case 'STAFF':
        return 'role-badge staff';
      case 'USER':
        return 'role-badge user';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading users...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <div className="header-content">
            <h1>All Users</h1>
            <p className="subtitle">Information on all user accounts</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn" title="Notifications">
              <span className="icon">🔔</span>
            </button>
            <div className="user-profile">
              <span className="user-avatar">👤</span>
              <span className="user-name">Đặng Phú Thiện</span>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="table-header">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Button variant="primary" onClick={() => handleOpenModal('create')}>
              ➕ Add New User
            </Button>
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th className="text-center">View</th>
                  <th className="text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>{user.phoneNumber}</td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.createdAt}</td>
                      <td className="text-center">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleOpenModal('edit', user)}
                          title="View/Edit"
                        >
                          👁️
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-pagination">
            <button className="pagination-btn">{'<'}</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">...</button>
            <button className="pagination-btn">{'>'}</button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'create' ? 'Add New User' : 'Edit User'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <Input
                  label="Username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={errors.username}
                  placeholder="Enter username"
                  disabled={modalMode === 'edit'}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter email"
                />
                {modalMode === 'create' && (
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    placeholder="Enter password"
                  />
                )}
                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  placeholder="Enter full name"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={errors.phoneNumber}
                  placeholder="Enter phone number"
                />
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {modalMode === 'create' ? 'Create User' : 'Update User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;
