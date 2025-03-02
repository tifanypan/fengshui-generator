// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export default api;
import axios from 'axios';

// Use correct URL format with http protocol
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased timeout for development
  timeout: 30000, // 30 seconds
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    // Add debug information for CORS issues
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('Possible CORS issue. Make sure the backend has CORS enabled and is running.');
    }
    
    return Promise.reject(error);
  }
);

export default api;