import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('Statistics');
    setSubtitle('Business statistics and reports');
  }, [setTitle, setSubtitle]);

  return (
    <div className="statistics-page">
      <div className="page-placeholder">
        <h2>Statistics Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default StatisticsPage;
