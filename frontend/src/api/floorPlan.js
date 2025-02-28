import api from './index';

export const uploadFloorPlan = async (file, roomType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('room_type', roomType);
  
  return api.post('/api/floor-plan/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const storeOccupantDetails = async (floorPlanId, occupants) => {
  return api.post(`/api/floor-plan/${floorPlanId}/occupants`, { occupants });
};

export const updateCompassOrientation = async (floorPlanId, orientation) => {
  return api.put(`/api/floor-plan/${floorPlanId}/compass`, { orientation });
};