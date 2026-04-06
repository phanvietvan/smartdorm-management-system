import { api } from './client'

export type Equipment = { name: string; status: string; quantity: number }

export type Room = { 
  _id: string; 
  name: string; 
  capacity: number; 
  floor: number; 
  price?: number; 
  contactPhone?: string;
  status: string; 
  areaId?: string | { _id: string; name: string };
  amenities?: string;
  equipments?: Equipment[];
  tenant?: { _id: string; fullName: string };
}

export const roomsApi = {
  getAvailable: () => api.get<Room[]>('/rooms/available'),
  getAll: () => api.get<Room[]>('/rooms'),
  getById: (id: string) => api.get<Room>(`/rooms/${id}`),
  getMyRoom: () => api.get<Room>('/rooms/my-room'),
  create: (data: Partial<Room>) => api.post<Room>('/rooms', data),
  update: (id: string, data: Partial<Room>) => api.put<Room>(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
}
