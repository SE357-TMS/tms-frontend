import { useState, useEffect, useCallback } from 'react';
import travelService from '../services/travelService';

export const useTravels = (filters = {}) => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTravels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await travelService.getAllTravels(filters);
      setTravels(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTravels();
  }, [fetchTravels]);

  const createTravel = async (travelData) => {
    try {
      const newTravel = await travelService.createTravel(travelData);
      setTravels([...travels, newTravel]);
      return newTravel;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTravel = async (id, travelData) => {
    try {
      const updatedTravel = await travelService.updateTravel(id, travelData);
      setTravels(travels.map(travel => travel.id === id ? updatedTravel : travel));
      return updatedTravel;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTravel = async (id) => {
    try {
      await travelService.deleteTravel(id);
      setTravels(travels.filter(travel => travel.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    travels,
    loading,
    error,
    fetchTravels,
    createTravel,
    updateTravel,
    deleteTravel,
  };
};
