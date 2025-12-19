import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Swal from "sweetalert2";
import "./CustomerHeader.css";
import SearchIcon from "../../../assets/icons/searchicon.svg";
import ShoppingCartIcon from "../../../assets/icons/shoppingcart.svg";

export default function CustomerHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login or create an account to view your cart. Would you like to login?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#4D40CA",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      navigate("/cart");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const getDisplayName = () => {
    if (!user) return "User";
    return user.fullName || user.username || "User";
  };

  const getRoleDisplay = () => {
    if (!user) return "Guest";
    if (user.roleId === 0 || user.role === "CUSTOMER") return "Customer";
    if (user.roleId === 1 || user.role === "STAFF") return "Staff";
    if (user.roleId === 2 || user.role === "ADMIN") return "Administrator";
    return "User";
  };

  const getAvatarDisplay = () => {
    if (!user) return "G";
    const name = user.fullName || user.username || "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="customer-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon-wrapper">
            <svg className="logo-icon-gradient" viewBox="0 0 22 22" fill="none">
              <defs>
                <linearGradient id="globeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6FC6A1" />
                  <stop offset="100%" stopColor="#4D40CA" />
                </linearGradient>
              </defs>
              <path
                d="M1.68675 14.6451L3.59494 13.5435C3.6983 13.4839 3.8196 13.4631 3.9369 13.4851L7.6914 14.1878C7.99995 14.2455 8.28478 14.008 8.28338 13.6941L8.26876 10.4045C8.26836 10.3151 8.29193 10.2272 8.33701 10.15L10.2317 6.90621C10.3303 6.73739 10.3215 6.52658 10.2091 6.3666L7.01892 1.82568M18.0002 3.85905C12.5002 6.50004 15.5 10 16.5002 10.5C18.3773 11.4384 20.9876 11.5 20.9876 11.5C20.9958 11.3344 21 11.1677 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21C11.1677 21 11.3344 20.9959 11.5 20.9877M15.7578 20.9398L12.591 12.591L20.9398 15.7578L17.2376 17.2376L15.7578 20.9398Z"
                stroke="url(#globeGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title">Travel</span>
            <span className="logo-subtitle">Adventure</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <img src={SearchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search tours..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit">SEARCH</button>
        </form>

        {/* Nav Actions */}
        <div className="nav-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="nav-link active">
              Log In
            </Link>
          ) : (
            <button onClick={handleLogout} className="nav-link">
              Log Out
            </button>
          )}
          <Link to="/help" className="nav-link">
            Help
          </Link>
          <button className="cart-icon" onClick={handleCartClick}>
            <img src={ShoppingCartIcon} alt="Cart" />
          </button>

          {isAuthenticated && (
            <div
              className="user-profile"
              onClick={() => setShowDropdown(!showDropdown)}
              ref={dropdownRef}
            >
              <div className="user-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={getDisplayName()} />
                ) : (
                  <div className="avatar-placeholder">{getAvatarDisplay()}</div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{getDisplayName()}</span>
                <span className="user-role">{getRoleDisplay()}</span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                className={`dropdown-arrow ${showDropdown ? "open" : ""}`}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {showDropdown && (
                <div className="user-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/profile")}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H18V16C18 13.34 12.67 12 10 12Z"
                        fill="currentColor"
                      />
                    </svg>
                    Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/my-bookings")}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M17 3H14V2C14 1.45 13.55 1 13 1H7C6.45 1 6 1.45 6 2V3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H17C18.1 19 19 18.1 19 17V5C19 3.9 18.1 3 17 3ZM8 2H12V3H8V2ZM17 17H3V5H17V17Z"
                        fill="currentColor"
                      />
                    </svg>
                    My Bookings
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/favorites")}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 17.77L8.77 16.66C3.1 11.52 0 8.65 0 5C0 2.24 2.24 0 5 0C6.74 0 8.41 0.81 10 2.09C11.59 0.81 13.26 0 15 0C17.76 0 20 2.24 20 5C20 8.65 16.9 11.52 11.23 16.66L10 17.77Z"
                        fill="currentColor"
                      />
                    </svg>
                    Favorites
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M14 6L12.59 7.41L14.17 9H6V11H14.17L12.59 12.59L14 14L18 10L14 6ZM2 2H10V0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H10V18H2V2Z"
                        fill="currentColor"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
