import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './InvoicesPage.css';

const InvoicesPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('All Invoices');
    setSubtitle('Information on all invoices');
  }, [setTitle, setSubtitle]);

  return (
    <div className="invoices-page">
      <div className="page-placeholder">
        <h2>Invoices Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default InvoicesPage;
