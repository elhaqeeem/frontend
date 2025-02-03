// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL, 
    withCredentials: true, // Tambahkan ini
});


// Add a request interceptor
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log("Token added to request:", token);
    } else {
        console.log("No token found in localStorage");
    }
    return config;
}, error => {
    return Promise.reject(error);
});


export default axiosInstance;
