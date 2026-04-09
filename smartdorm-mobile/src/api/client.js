import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tự động chọn URL phù hợp môi trường
// 192.168.1.13 là IP máy tính của bạn hiện tại
const LOCAL_IP = '192.168.1.13'; 

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  return `http://${LOCAL_IP}:5000/api`;
};

const client = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Interceptor tự động thêm Token vào Header mỗi khi gọi API
client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Lỗi lấy token từ Storage:", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;
