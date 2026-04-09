import client from './client';

export const billsApi = {
  getAll: (params) => client.get('/bills', { params }),
  getById: (id) => client.get(`/bills/${id}`),
  create: (data) => client.post('/bills', data),
  update: (id, data) => client.put(`/bills/${id}`, data),
  delete: (id) => client.delete(`/bills/${id}`),
  markPaid: (id) => client.patch(`/bills/${id}/mark-paid`),
  generateMonthly: () => client.post('/bills/generate-monthly'),
};

export const usersApi = {
  getAll: (params) => client.get('/users', { params }),
  getById: (id) => client.get(`/users/${id}`),
  create: (data) => client.post('/users', data),
  update: (id, data) => client.put(`/users/${id}`, data),
  delete: (id) => client.delete(`/users/${id}`),
  approve: (id) => client.patch(`/users/${id}/approve`),
  reject: (id) => client.patch(`/users/${id}/reject`),
  assignTenant: (data) => client.post('/users/assign-tenant', data),
  unassignTenant: (data) => client.post('/users/unassign-tenant', data),
  updateProfile: (data) => client.put('/users/profile', data),
  getRoommates: () => client.get('/users/roommates'),
};

export const roomsApi = {
  getAll: (params) => client.get('/rooms', { params }),
  getAvailable: () => client.get('/rooms/available'),
  getById: (id) => client.get(`/rooms/${id}`),
  create: (data) => client.post('/rooms', data),
  update: (id, data) => client.put(`/rooms/${id}`, data),
  delete: (id) => client.delete(`/rooms/${id}`),
};

export const maintenanceApi = {
  getAll: (params) => client.get('/maintenance', { params }),
  getById: (id) => client.get(`/maintenance/${id}`),
  create: (data) => client.post('/maintenance', data),
  update: (id, data) => client.put(`/maintenance/${id}`, data),
  delete: (id) => client.delete(`/maintenance/${id}`),
  updateStatus: (id, status) => client.patch(`/maintenance/${id}/status`, { status }),
};

export const notificationsApi = {
  getAll: (params) => client.get('/notifications', { params }),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`),
  readAll: () => client.patch('/notifications/read-all'),
  broadcast: (data) => client.post('/notifications/broadcast', data),
};

export const visitorsApi = {
  getAll: (params) => client.get('/visitors', { params }),
  getById: (id) => client.get(`/visitors/${id}`),
  create: (data) => client.post('/visitors', data),
  respond: (id, status) => client.patch(`/visitors/${id}/respond`, { status }),
  checkOut: (id) => client.patch(`/visitors/${id}/checkout`),
};

export const paymentsApi = {
  getHistory: (params) => client.get('/payments', { params }),
  getById: (id) => client.get(`/payments/${id}`),
  createVnpayUrl: (data) => client.post('/payments/vnpay/create', data),
  createManual: (data) => client.post('/payments/manual', data),
  confirm: (id) => client.patch(`/payments/${id}/confirm`),
  getStats: (params) => client.get('/payments/stats', { params }),
};

export const messagesApi = {
  getAll: (userId) => client.get(`/messages/${userId}`),
  send: (data) => client.post('/messages', data),
  getRecentConversations: () => client.get('/messages/conversations'),
};

export const rentalRequestsApi = {
  getAll: (params) => client.get('/rental-requests', { params }),
  getById: (id) => client.get(`/rental-requests/${id}`),
  create: (data) => client.post('/rental-requests', data),
  updateStatus: (id, data) => client.patch(`/rental-requests/${id}/status`, data),
};

export const areasApi = {
  getAll: () => client.get('/areas'),
  getById: (id) => client.get(`/areas/${id}`),
  create: (data) => client.post('/areas', data),
  update: (id, data) => client.put(`/areas/${id}`, data),
  delete: (id) => client.delete(`/areas/${id}`),
};

export const servicesApi = {
  getAll: () => client.get('/services'),
  create: (data) => client.post('/services', data),
  update: (id, data) => client.put(`/services/${id}`, data),
  delete: (id) => client.delete(`/services/${id}`),
};

export const dashboardApi = {
  getStats: () => client.get('/dashboard/stats'),
};

export const aiApi = {
  chat: async (message) => {
    const response = await fetch(client.defaults.baseURL + '/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`,
      },
      body: JSON.stringify({ message }),
    });
    return response;
  },
};
