import api from '../lib/httpHandler';

const BASE_PATH = '/api/v1/images';

const imageService = {
  getRouteImages: async (routeId) => {
    return api.get(`${BASE_PATH}/routes/${routeId}/images`);
  },
};

export default imageService;
