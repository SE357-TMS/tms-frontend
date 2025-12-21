import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../lib/httpHandler';
import './TripAddPage.css';
import addIcon from '../../assets/icons/addnew.svg';
import ChooseRouteModal from './ChooseRouteModal';

export default function TripAddPage() {
  const navigate = useNavigate();
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    routeId: '',
    routeName: '',
    destination: '',
    departure: '',
    departureDate: '',
    returnDate: '',
    pickupTime: '',
    pickupLocation: '',
    price: '',
    totalSeats: '',
    status: 'SCHEDULED',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleChooseRoute = () => {
    setShowRouteModal(true);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setForm((prev) => ({
      ...prev,
      routeId: route.id,
      routeName: route.routeName || '',
      destination: route.endLocation || '',
      departure: route.startLocation || '',
    }));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.routeId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please choose a route first',
        confirmButtonColor: '#4D40CA',
      });
      return;
    }

    if (!form.departureDate || !form.returnDate || !form.price || !form.totalSeats) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#4D40CA',
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare payload matching backend Trip entity
      const payload = {
        routeId: form.routeId,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        price: parseFloat(form.price),
        totalSeats: parseInt(form.totalSeats, 10),
        pickUpTime: form.pickupTime || null,
        pickUpLocation: form.pickupLocation || null,
        status: form.status,
      };

      console.log('Creating trip with payload:', payload);

      const response = await api.post('/api/v1/trips', payload);
      
      console.log('Trip created:', response);

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Trip has been created successfully',
        confirmButtonColor: '#4D40CA',
      });

      navigate('/trips');
    } catch (err) {
      console.error('Error creating trip:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Could not create trip',
        confirmButtonColor: '#4D40CA',
      });
    } finally {
      setLoading(false);
    }
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
              <input name="routeName" value={form.routeName} placeholder="Route name" readOnly />
            </label>

            <label>
              <div className="label">Destination</div>
              <input name="destination" value={form.destination} placeholder="Destination" readOnly />
            </label>

            <label>
              <div className="label">Departure</div>
              <input name="departure" value={form.departure} placeholder="Departure" readOnly />
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
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="FINISHED">Finished</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="confirm" disabled={loading}>
            {loading ? 'Creating...' : 'Confirm'}
          </button>
          <button type="button" className="cancel" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>

      {/* Choose Route Modal */}
      <ChooseRouteModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        onSelectRoute={handleRouteSelect}
      />
    </div>
  );
}
