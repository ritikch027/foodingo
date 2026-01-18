import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://foodingo-backend-8ay1.onrender.com/api',
  timeout: 10000, // 10s timeout for bad networks
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.authorization = token;
    }

    return config;
  },
  error => {
    console.log('Request error:', error);
    return Promise.reject(error);
  },
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

api.interceptors.response.use(
  response => {
    // Normalize API response
    return response;
  },
  error => {
    if (error.response) {
      // Server responded but with error
      console.log('API Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response (network issue)
      console.log('Network Error: No response from server');
    } else {
      // Something else broke
      console.log('API Setup Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
