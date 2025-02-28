import api from './index';

export const saveElements = async (floorPlanId, elements) => {
  return api.post(`/api/elements/${floorPlanId}`, elements);
};

export const getElements = async (floorPlanId) => {
  return api.get(`/api/elements/${floorPlanId}`);
};