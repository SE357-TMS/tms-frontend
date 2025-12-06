import React, { useEffect, useContext } from 'react';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './AttractionsPage.css';

const AttractionsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  useEffect(() => {
    setTitle('All Attractions');
    setSubtitle('Information on all tourist attractions');
  }, [setTitle, setSubtitle]);

  return (
    <div className="attractions-page">
      <div className="page-placeholder">
        <h2>Attractions Page</h2>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default AttractionsPage;
