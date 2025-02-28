import api from '../api';

export const testBackendConnection = async () => {
  try {
    const response = await api.get('/');
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const initializeRoomTypes = async () => {
  try {
    const response = await api.post('/api/room-types/init');
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};