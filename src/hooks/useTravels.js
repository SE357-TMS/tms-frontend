import { useState, useEffect, useCallback, useMemo } from "react";
import travelService from "../services/travelService";

export const useTravels = (filters) => {
	// Normalize and memoize filters to avoid stale/new object identity causing
	// fetch loops when caller doesn't pass a stable object (e.g. default {}).
	const memoFilters = useMemo(
		() => filters || {},
		[JSON.stringify(filters || {})]
	);
	const [travels, setTravels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchTravels = useCallback(async () => {
		try {
			setLoading(true);
			const data = await travelService.getAllTravels(memoFilters);
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
			setTravels(
				travels.map((travel) => (travel.id === id ? updatedTravel : travel))
			);
			return updatedTravel;
		} catch (err) {
			setError(err.message);
			throw err;
		}
	};

	const deleteTravel = async (id) => {
		try {
			await travelService.deleteTravel(id);
			setTravels(travels.filter((travel) => travel.id !== id));
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
