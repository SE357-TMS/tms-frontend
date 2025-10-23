import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>
        
        <div className="header-actions">
          <button className="notification-btn">
            <span className="icon">🔔</span>
          </button>
          
          <div className="user-menu">
            <div className="user-avatar">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
                alt={user?.name || 'User'} 
              />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">Admin</span>
            </div>
            <button className="dropdown-btn" onClick={handleLogout}>
              <span className="icon">⌄</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
