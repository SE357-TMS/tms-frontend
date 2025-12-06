import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './TripsPage.css';

const TripsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('All Trips');
    setSubtitle('Information on all trips');
  }, [setTitle, setSubtitle]);

  return (
    <div className="trips-page">
      <div className="page-placeholder">
        <h2>Trips Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default TripsPage;
