import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Layout for public pages (login, register)
    return <div className="public-layout">{children}</div>;
  }

  // Layout for authenticated pages (with sidebar)
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
