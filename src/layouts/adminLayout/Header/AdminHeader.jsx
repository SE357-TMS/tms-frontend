import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTitleContext } from "../AdminLayout/AdminTitleContext";
import { useAuth } from "../../../hooks/useAuth";
import bellIcon from "../../../assets/icons/bellring.svg";
import "./AdminHeader.css";

export default function AdminHeader() {
  const { title, subtitle } = useContext(AdminTitleContext);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Xác định role hiển thị
  const getRoleDisplay = (user) => {
    if (!user) return 'User';
    // Nếu có roleId
    if (user.roleId === 2) return 'Administrator';
    if (user.roleId === 1) return 'Staff';
    // Nếu có role string
    if (user.role === 'ADMIN') return 'Administrator';
    if (user.role === 'STAFF') return 'Staff';
    return 'User';
  };

  // Lấy tên hiển thị
  const getDisplayName = (user) => {
    if (!user) return 'User';
    return user.fullName || user.username || 'User';
  };

  // Lấy avatar
  const getAvatarDisplay = (user) => {
    if (!user) return 'U';
    const name = user.fullName || user.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <h1 className="admin-header-title">{title}</h1>
        {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
      </div>
      <div className="admin-header-actions">
        <button className="btn-notification" aria-label="Notifications">
          <img src={bellIcon} alt="Notifications" />
          <span className="notification-badge">3</span>
        </button>
        
        <div 
          className="user-profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={getDisplayName(user)} />
            ) : (
              <div className="avatar-placeholder-header">
                {getAvatarDisplay(user)}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{getDisplayName(user)}</div>
            <div className="user-role">{getRoleDisplay(user)}</div>
          </div>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none"
            className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
          >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {showDropdown && (
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H18V16C18 13.34 12.67 12 10 12Z" fill="currentColor"/>
                </svg>
                Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate('/settings')}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" fill="currentColor"/>
                  <path d="M17.14 10.94C17.18 10.64 17.2 10.33 17.2 10C17.2 9.68 17.18 9.36 17.13 9.06L19.16 7.48C19.34 7.34 19.39 7.07 19.28 6.87L17.36 3.55C17.24 3.33 16.99 3.26 16.77 3.33L14.38 4.29C13.88 3.91 13.35 3.59 12.76 3.35L12.4 0.81C12.36 0.57 12.16 0.4 11.92 0.4H8.08C7.84 0.4 7.65 0.57 7.61 0.81L7.25 3.35C6.66 3.59 6.12 3.92 5.63 4.29L3.24 3.33C3.02 3.25 2.77 3.33 2.65 3.55L0.74 6.87C0.62 7.08 0.66 7.34 0.86 7.48L2.89 9.06C2.84 9.36 2.8 9.69 2.8 10C2.8 10.31 2.82 10.64 2.87 10.94L0.84 12.52C0.66 12.66 0.61 12.93 0.72 13.13L2.64 16.45C2.76 16.67 3.01 16.74 3.23 16.67L5.62 15.71C6.12 16.09 6.65 16.41 7.24 16.65L7.6 19.19C7.65 19.43 7.84 19.6 8.08 19.6H11.92C12.16 19.6 12.36 19.43 12.39 19.19L12.75 16.65C13.34 16.41 13.88 16.08 14.37 15.71L16.76 16.67C16.98 16.75 17.23 16.67 17.35 16.45L19.27 13.13C19.39 12.91 19.34 12.66 19.15 12.52L17.14 10.94Z" fill="currentColor"/>
                </svg>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M14 6L12.59 7.41L14.17 9H6V11H14.17L12.59 12.59L14 14L18 10L14 6ZM2 2H10V0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H10V18H2V2Z" fill="currentColor"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
