import client from './client';

export const authApi = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  me: () => client.get('/auth/me'),
  changePassword: (data) => client.put('/auth/change-password', data),
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
};
