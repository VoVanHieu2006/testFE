import axios from 'axios';
import { API_BASE_URL } from './config';

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// them token vao request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// xu ly response error
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token het han, xoa token ra khoi request
            localStorage.removeItem('token');
            localStorage.removeItem('user');      
            localStorage.removeItem('currentTenant');      
            
        }
        return Promise.reject(error);
    }
);

export default axiosClient;