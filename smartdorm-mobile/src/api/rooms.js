import client from './client';

export const roomsApi = {
  getAll: () => client.get('/rooms'),
  getById: (id) => client.get(`/rooms/${id}`),
};
