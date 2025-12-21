import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTitleContext } from "../../layouts/adminLayout/AdminLayout/AdminTitleContext";
import Swal from "sweetalert2";
import tripService from "../../services/tripService";
import "./TripEditPage.css";

const TripEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setTitle, setSubtitle } = useContext(AdminTitleContext);

  // State for trip data
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState({
    departureDate: "",
    returnDate: "",
    pickUpTime: "",
    pickUpLocation: "",
    price: "",
    totalSeats: "",
    status: "SCHEDULED",
  });

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle("Edit Trip");
    setSubtitle("Update trip information");
  }, [setTitle, setSubtitle]);

  // Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await tripService.getTripById(id);
        const tripData = response.data.data;

        setTrip(tripData);
        setForm({
          departureDate: tripData.departureDate || "",
          returnDate: tripData.returnDate || "",
          pickUpTime: tripData.pickUpTime ? tripData.pickUpTime.substring(0, 5) : "",
          pickUpLocation: tripData.pickUpLocation || "",
          price: tripData.price || "",
          totalSeats: tripData.totalSeats || "",
          status: tripData.status || "SCHEDULED",
        });
      } catch (err) {
        console.error("Error fetching trip:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load trip details",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

      await tripService.updateTrip(id, updateData);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Trip updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Navigate back to trip detail
      setTimeout(() => {
        navigate(`/trips/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating trip:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update trip",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="trip-edit-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Loading trip details...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-edit-page">
        <div className="error-state">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="trip-edit-page">
      <div className="edit-container">
        <div className="edit-header">
          <div className="header-left">
            <button className="back-button" onClick={handleCancel}>
              ← Back
            </button>
            <div>
              <div className="title-text">Edit Trip</div>
              <div className="subtitle-text">Update trip information</div>
            </div>
          </div>
        </div>

        <div className="trip-info-summary">
          <div className="trip-name">{trip.routeName}</div>
          <div className="trip-route">
            {trip.startLocation} → {trip.endLocation}
          </div>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <div className="label">Departure date</div>
                <input
                  type="date"
                  name="departureDate"
                  value={form.departureDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                <div className="label">Return date</div>
                <input
                  type="date"
                  name="returnDate"
                  value={form.returnDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                <div className="label">Pick-up time</div>
                <input
                  type="time"
                  name="pickUpTime"
                  value={form.pickUpTime}
                  onChange={handleChange}
                />
              </label>

              <label>
                <div className="label">Pick-up location</div>
                <input
                  type="text"
                  name="pickUpLocation"
                  value={form.pickUpLocation}
                  onChange={handleChange}
                  placeholder="Enter pick-up location"
                />
              </label>

              <label>
                <div className="label">Price (VND)</div>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                />
              </label>

              <label>
                <div className="label">Total seats</div>
                <input
                  type="number"
                  name="totalSeats"
                  value={form.totalSeats}
                  onChange={handleChange}
                  placeholder="Enter total seats"
                  min="1"
                />
              </label>

              <label>
                <div className="label">Status</div>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="FINISHED">Finished</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-confirm"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Confirm"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default TripEditPage;
