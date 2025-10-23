import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '👥', label: 'Customers', path: '/customers' },
    { icon: '👔', label: 'Staffs', path: '/staffs' },
    { icon: '🗺️', label: 'Routes', path: '/routes' },
    { icon: '✈️', label: 'Trips', path: '/travels' },
    { icon: '📅', label: 'Bookings', path: '/bookings' },
    { icon: '📄', label: 'Invoices', path: '/invoices' },
    { icon: '🏛️', label: 'Attractions', path: '/attractions' },
    { icon: '📊', label: 'Statistics', path: '/statistics' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#6366f1" opacity="0.1"/>
              <path d="M20 8C13.4 8 8 13.4 8 20C8 26.6 13.4 32 20 32C26.6 32 32 26.6 32 20C32 13.4 26.6 8 20 8ZM20 14C21.1 14 22 14.9 22 16C22 17.1 21.1 18 20 18C18.9 18 18 17.1 18 16C18 14.9 18.9 14 20 14ZM24 26H16V24H18V20H16V18H20V24H22V26H24V26Z" fill="#6366f1"/>
            </svg>
          </div>
          <div className="logo-text">
            <h2>Travel</h2>
            <h2 className="adventure">Adventure</h2>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
