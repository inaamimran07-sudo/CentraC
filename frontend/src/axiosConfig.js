import axios from 'axios';
import API_URL from './config';

// Set base URL
axios.defaults.baseURL = API_URL;

// Add token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
