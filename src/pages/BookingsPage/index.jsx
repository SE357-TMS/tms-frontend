import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './BookingsPage.css';

const BookingsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('All Bookings');
    setSubtitle('Information on all bookings');
  }, [setTitle, setSubtitle]);

  return (
    <div className="bookings-page">
      <div className="page-placeholder">
        <h2>Bookings Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default BookingsPage;
