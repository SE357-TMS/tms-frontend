// Ví dụ sử dụng TanStack Query với TravelsPage

import React from 'react';
import { useTravelsQuery, useCreateTravel, useDeleteTravel } from '../../hooks/useTravelsQuery';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import '../TravelsPage/TravelsPage.css';

const TravelsPageWithQuery = () => {
  // Sử dụng React Query thay vì custom hook
  const { data: travels = [], isLoading, error } = useTravelsQuery();
  const createTravelMutation = useCreateTravel();
  const deleteTravelMutation = useDeleteTravel();

  const handleCreateTravel = async () => {
    try {
      await createTravelMutation.mutateAsync({
        title: 'Tour mới',
        description: 'Mô tả tour',
        status: 'PLANNED',
      });
      alert('Tạo tour thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDeleteTravel = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tour này?')) {
      try {
        await deleteTravelMutation.mutateAsync(id);
        alert('Xóa tour thành công!');
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error">Lỗi: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <h1>Danh sách tour du lịch</h1>
          <Button 
            variant="primary"
            onClick={handleCreateTravel}
            loading={createTravelMutation.isPending}
          >
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`status status-${travel.status}`}>
                    {travel.status}
                  </span>
                  <Button 
                    variant="danger" 
                    size="small"
                    onClick={() => handleDeleteTravel(travel.id)}
                    loading={deleteTravelMutation.isPending}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TravelsPageWithQuery;
