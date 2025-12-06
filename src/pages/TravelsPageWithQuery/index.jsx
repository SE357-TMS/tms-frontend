// Ví dụ sử dụng TanStack Query với TravelsPage

import React, { useEffect, useContext } from 'react';
import { useTravelsQuery, useCreateTravel, useDeleteTravel } from '../../hooks/useTravelsQuery';
import Button from '../../components/common/Button';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import '../TravelsPage/TravelsPage.css';

const TravelsPageWithQuery = () => {
  // Sử dụng React Query thay vì custom hook
  const { data: travels = [], isLoading, error } = useTravelsQuery();
  const createTravelMutation = useCreateTravel();
  const deleteTravelMutation = useDeleteTravel();
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  // Set page title
  useEffect(() => {
    setTitle('All Routes');
    setSubtitle('Information on all travel routes');
  }, [setTitle, setSubtitle]);

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
      <div className="travels-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="travels-page">
        <div className="error">Lỗi: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="travels-page">
      <div className="tasks-header">
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
  );
};

export default TravelsPageWithQuery;
