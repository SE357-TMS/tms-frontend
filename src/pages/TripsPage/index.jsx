import React, { useEffect, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTitleContext } from '../../layouts/adminLayout/AdminLayout/AdminTitleContext';
import './TripsPage.css';
import viewIcon from '../../assets/icons/view.svg';

const sampleTrips = [
  {
    id: 1,
    name: 'Thái Lan: Bangkok - Pattaya (Nong Village)',
    departure: '15:05 April 23, 2025',
    pickup: 'Da Nang International Airport',
    status: 'Waiting',
    price: '4.990.000 đ',
    booked: '19/21',
  },
  {
    id: 2,
    name: 'Vietnam: Da Nang - Hoi An',
    departure: '09:00 May 02, 2025',
    pickup: 'Da Nang International Airport',
    status: 'Completed',
    price: '1.200.000 đ',
    booked: '21/21',
  },
  {
    id: 3,
    name: 'Laos: Vientiane - Luang Prabang',
    departure: '07:30 June 10, 2025',
    pickup: 'Noi Bai Airport',
    status: 'Waiting',
    price: '3.500.000 đ',
    booked: '5/20',
  },
];

const TripsPage = () => {
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setTitle('All Trips');
    setSubtitle('Information on all trips');
  }, [setTitle, setSubtitle]);

  const trips = useMemo(() => {
    if (!query) return sampleTrips;
    return sampleTrips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="trips-page">
      <div className="trips-row-1">
        <div className="trips-filters">
          <div className="trips-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        <button
          className="btn-add-booking"
          onClick={() => navigate('/trips/new')}
        >
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path
              d="M12.25 7.25V17.25M7.25 12.25H17.25M7 23.5H17.5C19.6002 23.5 20.6503 23.5 21.4525 23.0913C22.1581 22.7317 22.7317 22.1581 23.0913 21.4525C23.5 20.6503 23.5 19.6002 23.5 17.5V7C23.5 4.8998 23.5 3.8497 23.0913 3.04754C22.7317 2.34193 22.1581 1.76825 21.4525 1.40873C20.6503 1 19.6002 1 17.5 1H7C4.8998 1 3.8497 1 3.04754 1.40873C2.34193 1.76825 1.76825 2.34193 1.40873 3.04754C1 3.8497 1 4.8998 1 7V17.5C1 19.6002 1 20.6503 1.40873 21.4525C1.76825 22.1581 2.34193 22.7317 3.04754 23.0913C3.8497 23.5 4.8998 23.5 7 23.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add new Trip
        </button>
      </div>

      <div className="trips-table-wrapper">
        <div className="trips-table-container">
          <table className="trips-table">
            <thead>
              <tr>
                <th>Tripname</th>
                <th>Departure date</th>
                <th>Pick-up location</th>
                <th style={{textAlign:'center'}}>Status</th>
                <th style={{textAlign:'center'}}>Price</th>
                <th style={{textAlign:'center'}}>Booked</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td>
                    <div className="trip-info">
                      <div className="trip-name">{trip.name}</div>
                      <div className="trip-sub">Short description or route</div>
                    </div>
                  </td>
                  <td className="trip-departure">{trip.departure}</td>
                  <td className="trip-pickup">{trip.pickup}</td>
                  <td style={{textAlign:'center'}}>
                    <span className={`status-badge ${trip.status.toLowerCase() === 'completed' ? 'completed' : 'waiting'}`}>{trip.status}</span>
                  </td>
                  <td className="trip-price" style={{textAlign:'center'}}>{trip.price}</td>
                  <td className="trip-booked">{trip.booked}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        title="View"
                      >
                        <img src={viewIcon} alt="View" />
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => alert(`Edit ${trip.id}`)}
                        title="Edit"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12.75 3L15 5.25L4.5 15.75L1.5 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="btn-cancel-booking"
                        onClick={() => alert(`Delete ${trip.id}`)}
                        title="Delete"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="trips-pagination-wrapper">
          <div className="pagination-info">Showing {trips.length} trips</div>
          <div className="trips-pagination">
            <button className="pagination-btn">‹</button>
            <button className="pagination-btn">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
