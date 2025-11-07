import React, { useContext } from "react";
import { AdminTitleContext } from "../AdminLayout/AdminTitleContext";
import "./AdminHeader.css";

export default function AdminHeader() {
  const { title, subtitle } = useContext(AdminTitleContext);

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <h1 className="admin-header-title">{title}</h1>
        <p className="admin-header-subtitle">{subtitle}</p>
      </div>
      <div className="admin-header-actions">
        <button className="admin-header-btn admin-notification-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <div className="admin-header-user">
          <div className="admin-user-avatar">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#C34141" opacity="0.1"/>
              <circle cx="16" cy="12" r="5" fill="#C34141"/>
              <path d="M7 26C7 21.58 10.58 18 15 18H17C21.42 18 25 21.58 25 26V28H7V26Z" fill="#C34141"/>
            </svg>
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">Admin</span>
            <span className="admin-user-role">Quản trị viên</span>
          </div>
        </div>
      </div>
    </header>
  );
}
