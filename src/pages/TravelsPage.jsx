import React from 'react';
import { useTravels } from '../hooks/useTravels';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import './TravelsPage.css';

const TravelsPage = () => {
  const { travels, loading, error } = useTravels();

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error">Lỗi: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <h1>Danh sách tour du lịch</h1>
          <Button variant="primary">
            + Thêm tour
          </Button>
        </div>
        <div className="tasks-list">
          {travels.length === 0 ? (
            <p>Chưa có tour du lịch nào</p>
          ) : (
            travels.map(travel => (
              <div key={travel.id} className="task-card">
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
    </Layout>
  );
};

export default TravelsPage;
