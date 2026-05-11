import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor: Trước khi gửi bất kỳ request nào, tự động nhét Token vào Header
api.interceptors.request.use(
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

// Interceptor: Bắt lỗi trả về (Ví dụ token hết hạn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Tự động logout nếu token sai/hết hạn
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;