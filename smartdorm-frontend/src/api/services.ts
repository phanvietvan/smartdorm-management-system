import { api } from './client'

export type Service = {
  _id: string
  name: string
  unitPrice: number
  unit: string
  description?: string
  createdAt: string
}

export const servicesApi = {
  getAll: () => api.get<Service[]>('/services'),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: { name: string; unitPrice: number; unit: string; description?: string }) =>
    api.post<Service>('/services', data),
  update: (id: string, data: Partial<{ name: string; unitPrice: number; unit: string; description: string }>) =>
    api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
}
