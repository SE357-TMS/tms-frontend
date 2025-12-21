import React, { useState } from 'react';
import './EditTripModal.css';

export default function EditTripModal({ trip, onClose, onSave }) {
  const [form, setForm] = useState({ ...trip });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onSave && onSave(form);
    onClose && onClose();
  };

  return (
    <div className="edit-modal-overlay" onMouseDown={onClose}>
      <div className="edit-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
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
              <input type="time" name="pickupTime" value={form.pickupTime || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Pick-up location</div>
              <input name="pickupLocation" value={form.pickupLocation || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Price</div>
              <input name="price" value={form.price || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Total seats</div>
              <input name="totalSeats" value={form.totalSeats || ''} onChange={handleChange} />
            </label>

            <label>
              <div className="label">Status</div>
              <select name="status" value={form.status || ''} onChange={handleChange}>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="confirm">Confirm</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
