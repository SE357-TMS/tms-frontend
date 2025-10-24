import React from 'react';
import Layout from '../../components/layout/Layout';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="subtitle">Chào mừng trở lại với Travel Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>Khách hàng</h3>
              <p className="stat-value">1,234</p>
              <span className="stat-change positive">+12% từ tháng trước</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✈️</div>
            <div className="stat-info">
              <h3>Tours</h3>
              <p className="stat-value">856</p>
              <span className="stat-change positive">+8% từ tháng trước</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📅</div>
            <div className="stat-info">
              <h3>Bookings</h3>
              <p className="stat-value">342</p>
              <span className="stat-change positive">+15% từ tháng trước</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">💰</div>
            <div className="stat-info">
              <h3>Doanh thu</h3>
              <p className="stat-value">$52,890</p>
              <span className="stat-change positive">+23% từ tháng trước</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dashboard-content">
          {/* Favorite Routes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Favorite travel route of the month</h2>
            </div>
            <div className="routes-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="route-card">
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&h=250&fit=crop`} 
                    alt="Route" 
                  />
                  <div className="route-info">
                    <span className="route-tag">Japan</span>
                    <h3>Osaka - Kobe - Kyoto - Hamamatsu</h3>
                    <div className="route-details">
                      <span>✈️ HCM990508</span>
                      <span>🕐 10 Days</span>
                    </div>
                    <div className="route-footer">
                      <span className="route-price">$285.95</span>
                      <button className="btn-details">More details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings & Calendar */}
          <div className="dashboard-sidebar">
            {/* Upcoming Trips Calendar */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Upcoming Trips</h2>
                <span className="month-badge">October</span>
              </div>
              <div className="calendar">
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-label">{day}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => (
                    <div key={i + 1} className={`calendar-day ${i === 14 || i === 23 ? 'highlighted' : ''}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Favorite Attractions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Favorite Attractions</h2>
                <button className="btn-see-more">See more</button>
              </div>
              <div className="attractions-grid">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="attraction-thumb">
                    <img 
                      src={`https://images.unsplash.com/photo-${1520000000000 + i * 1000000}?w=200&h=150&fit=crop`} 
                      alt="Attraction" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Bookings</h2>
          </div>
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { route: 'Osaka - Kobe - Kyoto - Hamamatsu', qty: 1, status: 'Completed' },
                  { route: 'Osaka - Kobe - Kyoto - Hamamatsu', qty: 1, status: 'Waiting' },
                  { route: 'Osaka - Kobe - Kyoto - Hamamatsu', qty: 1, status: 'Completed' },
                  { route: 'Osaka - Kobe - Kyoto - Hamamatsu', qty: 1, status: 'Completed' },
                  { route: 'Osaka - Kobe - Kyoto - Hamamatsu', qty: 1, status: 'Cancelled' },
                ].map((booking, i) => (
                  <tr key={i}>
                    <td>
                      <div className="route-cell">
                        <img 
                          src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=50&h=50&fit=crop`} 
                          alt="Route" 
                        />
                        <span>{booking.route}</span>
                      </div>
                    </td>
                    <td>{booking.qty}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <button>{'<'}</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>...</button>
            <button>{'>'}</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
