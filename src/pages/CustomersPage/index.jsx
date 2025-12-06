import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './CustomersPage.css';

const CustomersPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('All Customers');
    setSubtitle('Information on all customers');
  }, [setTitle, setSubtitle]);

  return (
    <div className="customers-page">
      <div className="page-placeholder">
        <h2>Customers Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default CustomersPage;
