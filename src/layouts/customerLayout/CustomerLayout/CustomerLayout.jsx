import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../CustomerHeader/CustomerHeader';
import './CustomerLayout.css';

export default function CustomerLayout() {
  return (
    <div className="customer-layout">
      <CustomerHeader />
      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  );
}
