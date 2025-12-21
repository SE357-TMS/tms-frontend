import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TripAddPage.css';
import addIcon from '../../assets/icons/addnew.svg';

export default function TripAddPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    routeName: '',
    destination: '',
    departure: '',
    departureDate: '',
    returnDate: '',
    pickupTime: '',
    pickupLocation: '',
    price: '',
    totalSeats: '',
    status: 'ACTIVE',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleChooseRoute = () => {
    alert('Choose route (not implemented)');
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    // TODO: call API to create trip
    console.log('Create trip', form);
    navigate('/trips');
  };

  const handleCancel = () => {
    navigate('/trips');
  };

  return (
    <div className="trip-add-page">
      <div className="trip-add-header">
        <div className="trip-add-title">
          <img src={addIcon} alt="add" className="add-icon" />
          <span className="title-text">Add new Trip</span>
        </div>
        <div className="trip-add-sub">Detailed information about the trip &gt; Add new Trip</div>
      </div>

      <form className="trip-add-form" onSubmit={handleConfirm}>
        <section className="section route-info">
          <div className="section-head">
            <h3 className="section-title">Route information</h3>
            <button type="button" className="btn-choose" onClick={handleChooseRoute}>Choose Route</button>
          </div>

          <div className="grid grid-3">
            <label>
              <div className="label">Route name</div>
              <input name="routeName" value={form.routeName} onChange={handleChange} placeholder="Route name" />
            </label>

            <label>
              <div className="label">Destination</div>
              <input name="destination" value={form.destination} onChange={handleChange} placeholder="Destination" />
            </label>

            <label>
              <div className="label">Departure</div>
              <input name="departure" value={form.departure} onChange={handleChange} placeholder="Departure" />
            </label>
          </div>
        </section>

        <section className="section trip-info">
          <h3 className="section-title">Trip information</h3>

          <div className="grid grid-4">
            <label>
              <div className="label">Departure date</div>
              <input type="date" name="departureDate" value={form.departureDate} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Return date</div>
              <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Pick-up time</div>
              <input type="time" name="pickupTime" value={form.pickupTime} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Pick-up location</div>
              <input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} placeholder="Pick-up location" />
            </label>
          </div>

          <div className="grid grid-3 mt-20">
            <label>
              <div className="label">Price</div>
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price" />
            </label>

            <label>
              <div className="label">Total seats</div>
              <input name="totalSeats" value={form.totalSeats} onChange={handleChange} placeholder="Total seats" />
            </label>

            <label>
              <div className="label">Status</div>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="confirm">Confirm</button>
          <button type="button" className="cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
