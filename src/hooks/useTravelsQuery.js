import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import travelService from '../services/travelService';

// Hook để lấy danh sách travels
export const useTravelsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['travels', filters],
    queryFn: () => travelService.getAllTravels(filters),
  });
};

// Hook để lấy travel theo ID
export const useTravelQuery = (id) => {
  return useQuery({
    queryKey: ['travel', id],
    queryFn: () => travelService.getTravelById(id),
    enabled: !!id, // Chỉ fetch khi có id
  });
};

// Hook để tạo travel mới
export const useCreateTravel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (travelData) => travelService.createTravel(travelData),
    onSuccess: () => {
      // Invalidate và refetch danh sách travels
      queryClient.invalidateQueries({ queryKey: ['travels'] });
    },
  });
};

// Hook để cập nhật travel
export const useUpdateTravel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => travelService.updateTravel(id, data),
    onSuccess: (_, variables) => {
      // Invalidate travel detail và danh sách
      queryClient.invalidateQueries({ queryKey: ['travel', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['travels'] });
    },
  });
};

// Hook để xóa travel
export const useDeleteTravel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => travelService.deleteTravel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] });
    },
  });
};

// Hook để cập nhật trạng thái travel
export const useUpdateTravelStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => travelService.updateTravelStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['travel', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['travels'] });
    },
  });
};
