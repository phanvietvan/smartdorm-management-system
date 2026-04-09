import axios from 'axios';
import { Platform } from 'react-native';

// Use local IP for mobile access to host backend
const LOCAL_IP = '192.168.50.126'; 
const BASE_URL = `http://${LOCAL_IP}:5000/api`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth
client.interceptors.request.use(async (config) => {
  // We will add token handling here later with AsyncStorage
  return config;
});

export default client;
