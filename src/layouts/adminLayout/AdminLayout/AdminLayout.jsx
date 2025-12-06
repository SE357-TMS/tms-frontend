import React, { useState } from "react";
import "./AdminLayout.css";
import Navigation from "../Navigation/Navigation";
import AdminHeader from "../Header/AdminHeader";
import { AdminTitleContext } from "./AdminTitleContext";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState("Welcome back!");

  return (
    <AdminTitleContext.Provider value={{ title, subtitle, setTitle, setSubtitle }}>
      <div className="admin-container">
        <Navigation />
        <div className="admin-main">
          <AdminHeader />
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminTitleContext.Provider>
  );
}
