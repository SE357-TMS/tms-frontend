import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import customerProfileService from "../../../services/customerProfileService";
import "./CustomerSidebar.css";

// Import icons
import SaveFavIcon from "../../../assets/icons/savefav.svg";
import ShoppingCartIcon from "../../../assets/icons/shoppingcart02.svg";
import BookingIcon from "../../../assets/icons/booking.svg";
import SetAccIcon from "../../../assets/icons/setacc.svg";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

export default function CustomerSidebar({ activeTab = "cart" }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await customerProfileService.getProfile();
        const profileData = response?.data?.data;
        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const displayName = profile?.fullName || user?.fullName || user?.username || "Guest";
  const displayEmail = profile?.email || "Not logged in";
  const avatarUrl = profile?.avatarUrl || DEFAULT_AVATAR;

  const navItems = [
    {
      key: "favorites",
      path: "/favorites",
      icon: SaveFavIcon,
      label: "Saved Favorites",
    },
    {
      key: "cart",
      path: "/cart",
      icon: ShoppingCartIcon,
      label: "Shopping Cart",
    },
    {
      key: "bookings",
      path: "/reservations",
      icon: BookingIcon,
      label: "Booking",
    },
    {
      key: "account",
      path: "/account",
      icon: SetAccIcon,
      label: "Account",
    },
  ];

  return (
    <aside className="customer-sidebar">
      <div className="profile-summary">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="avatar-large"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
          }}
        />
        {loading ? (
          <div className="profile-loading">Loading...</div>
        ) : (
          <>
            <h2 className="user-name">{displayName}</h2>
            <p className="user-email">{displayEmail}</p>
          </>
        )}
      </div>
      <hr className="divider" />
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive || activeTab === item.key ? "active" : ""}`
            }
          >
            <img src={item.icon} alt={item.label} className="sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
