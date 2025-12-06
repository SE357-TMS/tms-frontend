import React, { useEffect, useContext } from 'react';
import { useTravels } from '../../hooks/useTravels';
import Button from '../../components/common/Button';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './TravelsPage.css';

const RoutesPage = () => {
  const { travels, loading, error } = useTravels();
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  // Set page title
  useEffect(() => {
    setTitle('All Routes');
    setSubtitle('Information on all travel routes');
  }, [setTitle, setSubtitle]);

  if (loading) {
    return (
      <div className="routes-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="routes-page">
        <div className="error">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="routes-page">
      <div className="routes-header">
        <Button variant="primary">
          + Thêm tuyến đường
        </Button>
      </div>
      <div className="routes-list">
        {travels.length === 0 ? (
          <p>Chưa có tuyến đường nào</p>
        ) : (
          travels.map(travel => (
            <div key={travel.id} className="route-card">
              <h3>{travel.title}</h3>
              <p>{travel.description}</p>
              <span className={`status status-${travel.status}`}>
                {travel.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
