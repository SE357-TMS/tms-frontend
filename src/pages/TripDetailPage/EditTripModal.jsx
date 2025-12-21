import React, { useState } from 'react';
import './EditTripModal.css';
import tripService from '../../services/tripService';
import Swal from 'sweetalert2';

export default function EditTripModal({ trip, onClose, onSave }) {
  const [form, setForm] = useState({ 
    ...trip,
    pickUpTime: trip.pickUpTime ? trip.pickUpTime.substring(0, 5) : ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const updateData = {
        departureDate: form.departureDate || null,
        returnDate: form.returnDate || null,
        pickUpTime: form.pickUpTime ? `${form.pickUpTime}:00` : null,
        pickUpLocation: form.pickUpLocation || null,
        price: form.price ? parseFloat(form.price) : null,
        totalSeats: form.totalSeats ? parseInt(form.totalSeats) : null,
        status: form.status,
      };

      const response = await tripService.updateTrip(trip.id, updateData);
      const updatedTrip = response.data?.data;
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Trip updated successfully!',
        timer: 1500,
        showConfirmButton: false,
      });
      
      onSave && onSave(updatedTrip || form);
      onClose && onClose();
    } catch (err) {
      console.error('Error updating trip:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update trip',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-modal-overlay" onMouseDown={onClose}>
      <div className="edit-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={submitting}>✕</button>
        <div className="modal-title">
          <div className="title-text">Edit Trip</div>
          <div className="title-icon">✏️</div>
        </div>

        <form className="edit-form" onSubmit={handleConfirm}>
          <div className="form-grid">
            <label>
              <div className="label">Departure date</div>
              <input type="date" name="departureDate" value={form.departureDate || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Return date</div>
              <input type="date" name="returnDate" value={form.returnDate || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Pick-up time</div>
              <input type="time" name="pickUpTime" value={form.pickUpTime || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Pick-up location</div>
              <input name="pickUpLocation" value={form.pickUpLocation || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Price</div>
              <input type="number" name="price" value={form.price || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Total seats</div>
              <input type="number" name="totalSeats" value={form.totalSeats || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Status</div>
              <select name="status" value={form.status || ''} onChange={handleChange}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="FINISHED">Finished</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="confirm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Confirm'}
            </button>
            <button type="button" className="cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
