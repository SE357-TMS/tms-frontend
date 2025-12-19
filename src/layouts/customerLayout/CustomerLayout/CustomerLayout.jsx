import React from "react";
import { Outlet } from "react-router-dom";
import CustomerHeader from "../Header/CustomerHeader";
import "./CustomerLayout.css";

export default function CustomerLayout() {
  return (
    <div className="customer-container">
      <CustomerHeader />
      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}
