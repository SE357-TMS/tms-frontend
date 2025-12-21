import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripDetailPage.css';
import viewIcon from '../../assets/icons/view.svg';
import addNewIcon from '../../assets/icons/addnew.svg';
import searchIcon from '../../assets/icons/searchicon.svg';
import EditTripModal from './EditTripModal';

const mockTrip = {
  id: 1,
  title: 'Thái Lan: Bangkok - Pattaya (Chợ nổi, chùa Phật Lớn, Suan Thai Pattaya)',
  departureDate: '31/12/2025',
  returnDate: '22/01/2026',
  pickupTime: '23:35',
  pickupLocation: 'Sân bay Tân Sơn Nhất',
  price: '18.190.000 đ',
  bookedSeats: 11,
  totalSeats: 15,
  status: 'ONGOING',
  travelers: [
    { id: 'SGTL239', fullName: 'Đặng Phú Thiện', gender: 'Nam', birthday: '07/01/2001', identity: 'B8901234' },
    { id: 'SGTL240', fullName: 'Nguyễn Thị A', gender: 'Nữ', birthday: '12/03/1995', identity: 'A1234567' },
  ],
};

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    // For now use mock data. Replace with API fetch later.
    setTrip(mockTrip);
  }, [id]);

  if (!trip) return null;

  return (
    <div className="trip-detail-page">
      <div className="trip-header">
        <h1>Trip Information</h1>
        <p className="trip-sub">Detailed information about the trip</p>
      </div>

      <div className="trip-info-card">
        <div className="trip-title">{trip.title}</div>

        <div className="trip-metrics">
          <div className="metric">
            <div className="label">Departure date</div>
            <div className="value">{trip.departureDate}</div>
          </div>
          <div className="metric">
            <div className="label">Return date</div>
            <div className="value">{trip.returnDate}</div>
          </div>
          <div className="metric">
            <div className="label">Pick-up time</div>
            <div className="value">{trip.pickupTime}</div>
          </div>
          <div className="metric">
            <div className="label">Pick-up location</div>
            <div className="value">{trip.pickupLocation}</div>
          </div>
          <div className="metric">
            <div className="label">Price</div>
            <div className="value">{trip.price}</div>
          </div>
          <div className="metric">
            <div className="label">Booked seats</div>
            <div className="value">{trip.bookedSeats}</div>
          </div>
          <div className="metric">
            <div className="label">Total seats</div>
            <div className="value">{trip.totalSeats}</div>
          </div>
          <div className="metric">
            <div className="label">Status</div>
            <div className="value status">{trip.status}</div>
          </div>
        </div>

        <button className="btn-edit-trip" title="Edit trip" onClick={() => setShowEdit(true)}>
          ✏️
        </button>
        {showEdit && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEdit(false)}
            onSave={(updated) => setTrip(updated)}
          />
        )}
      </div>

      <div className="travelers-section">
        <div className="section-header">
          <h2>List of Booking Travelers</h2>
          <div className="section-actions">
            <div className="search-box">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input className="search-input" placeholder="Search..." />
            </div>
            <button className="btn-add-booking" onClick={() => navigate(`/bookings/new?tripId=${trip.id}`)}>
              <img src={addNewIcon} alt="Add" />
              Add new Booking for Trip
            </button>
          </div>
        </div>

        <div className="traveler-table-wrapper">
          <table className="traveler-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Full name</th>
                <th>Gender</th>
                <th>Birthday</th>
                <th>Identity</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trip.travelers.map(t => (
                <tr key={t.identity}>
                  <td>{t.id}</td>
                  <td>{t.fullName}</td>
                  <td>{t.gender}</td>
                  <td>{t.birthday}</td>
                  <td>{t.identity}</td>
                  <td style={{textAlign:'center'}}>
                    <button className="btn-view" title="View"><img src={viewIcon} alt="View"/></button>
                    <button className="btn-delete" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
