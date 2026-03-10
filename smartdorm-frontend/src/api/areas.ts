import { api } from './client'

export type Area = {
  _id: string
  name: string
  address?: string
  description?: string
}

export const areasApi = {
  getAll: () => api.get<Area[]>('/areas'),
  getById: (id: string) => api.get<Area>(`/areas/${id}`),
  create: (data: Partial<Area>) => api.post<Area>('/areas', data),
  update: (id: string, data: Partial<Area>) => api.put<Area>(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
}
