import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTravelQuery } from '../../hooks/useTravelsQuery';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { TRAVEL_STATUS_LABELS, TRAVEL_TYPE_LABELS } from '../../constants';
import './TravelDetailPage.css';

const TravelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: travel, isLoading, error } = useTravelQuery(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Đang tải thông tin tour...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error">
          <p>Lỗi: {error.message}</p>
          <Button onClick={() => navigate('/travels')}>Quay lại danh sách</Button>
        </div>
      </Layout>
    );
  }

  if (!travel) {
    return (
      <Layout>
        <div className="error">
          <p>Không tìm thấy tour</p>
          <Button onClick={() => navigate('/travels')}>Quay lại danh sách</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="travel-detail-page">
        <div className="detail-header">
          <Button variant="secondary" onClick={() => navigate('/travels')}>
            ← Quay lại
          </Button>
          <div className="detail-actions">
            <Button variant="primary">Chỉnh sửa</Button>
            <Button variant="danger">Xóa</Button>
          </div>
        </div>

        <div className="detail-content">
          <h1>{travel.title}</h1>
          
          <div className="detail-badges">
            <span className={`badge status-${travel.status}`}>
              {TRAVEL_STATUS_LABELS[travel.status] || travel.status}
            </span>
            {travel.type && (
              <span className="badge type-badge">
                {TRAVEL_TYPE_LABELS[travel.type] || travel.type}
              </span>
            )}
          </div>

          <div className="detail-info">
            <div className="info-section">
              <h3>Mô tả</h3>
              <p>{travel.description || 'Chưa có mô tả'}</p>
            </div>

            <div className="info-section">
              <h3>Thông tin chi tiết</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Ngày bắt đầu:</span>
                  <span className="value">{travel.startDate || 'Chưa xác định'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ngày kết thúc:</span>
                  <span className="value">{travel.endDate || 'Chưa xác định'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Điểm đến:</span>
                  <span className="value">{travel.destination || 'Chưa xác định'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Giá:</span>
                  <span className="value">{travel.price ? `${travel.price.toLocaleString()} VNĐ` : 'Liên hệ'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TravelDetailPage;
