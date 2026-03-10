import { api } from './client'

export type UserStatus = 'pending' | 'approved' | 'rejected'

export type User = {
  _id: string
  email: string
  fullName: string
  phone?: string
  role: string
  roomId?: string
  managedAreaId?: string
  avatarUrl?: string
  idCardNumber?: string
  address?: string
}

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getPending: () => api.get<User[]>('/users', { params: { status: 'pending' } }),
  getTenantCandidates: () =>
    api.get<User[]>('/users', { params: { role: 'guest', status: 'approved' } }),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  approve: (id: string) => api.post<User>(`/users/${id}/approve`),
  reject: (id: string) => api.post<User>(`/users/${id}/reject`),
  assignTenant: (data: { userId: string; roomId: string }) =>
    api.post('/users/assign-tenant', data),
  updateMe: (data: Partial<User>) =>
    api.put<User>('/users/me', data),
}
