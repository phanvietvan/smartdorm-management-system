import { api } from './client'

export type MaintenanceRequest = {
  _id: string
  roomId: { _id: string; name: string; floor?: number }
  tenantId: { _id: string; fullName: string; phone?: string }
  assignedTo?: { _id: string; fullName: string }
  title: string
  description?: string
  status: string
  images?: string[]
  note?: string
  rating?: number
  review?: string
  createdAt: string
  completedAt?: string
}

export const maintenanceApi = {
  getAll: (params?: { status?: string; roomId?: string }) =>
    api.get<MaintenanceRequest[]>('/maintenance', { params }),
  getById: (id: string) => api.get<MaintenanceRequest>(`/maintenance/${id}`),
  create: (data: { roomId: string; title: string; description?: string }) =>
    api.post<MaintenanceRequest>('/maintenance', data),
  update: (id: string, data: Partial<{ status: string; images: string[]; note: string }>) =>
    api.put<MaintenanceRequest>(`/maintenance/${id}`, data),
  assign: (id: string, staffId: string) =>
    api.put<MaintenanceRequest>(`/maintenance/${id}/assign`, { staffId }),
  confirmDone: (id: string, data: { rating: number; review?: string }) =>
    api.put<MaintenanceRequest>(`/maintenance/${id}/confirm-done`, data),
}
