import React from "react";
import "./AdminLayout.css";
import Navigation from "../Navigation/Navigation";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <Navigation />
      <div className="admin-main">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
