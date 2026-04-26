import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đổi thành URL ngrok của bạn khi production
// TIP: Nếu test trên trình duyệt máy tính, bạn có thể dùng 'http://localhost:5000' để tránh lỗi ngrok warning
const API_BASE_URL = 'https://lenard-subentire-acknowledgingly.ngrok-free.app';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': '69420', // Header đặc biệt để bỏ qua trang cảnh báo của ngrok
  },
  timeout: 15000,
});

// Request interceptor: tự động thêm token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý 401
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export default client;
