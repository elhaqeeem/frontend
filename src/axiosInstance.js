// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Update with your API URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Replace with your method of retrieving the token
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
