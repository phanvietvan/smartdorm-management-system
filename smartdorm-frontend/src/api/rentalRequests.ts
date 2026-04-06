import { api } from './client'

export type RentalRequest = {
  _id?: string;
  fullName: string;
  phone: string;
  email: string;
  roomId: string;
  message?: string;
  status?: string;
}

export const rentalApi = {
  create: (data: RentalRequest) => api.post<RentalRequest>('/rental-requests', data),
  getAll: (status?: string) => api.get<RentalRequest[]>('/rental-requests', { params: { status } }),
  process: (id: string, status: string, note: string) => 
    api.put(`/rental-requests/${id}/process`, { status, note }),
}
