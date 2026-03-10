import { api } from './client'

export type UserStatus = 'pending' | 'approved' | 'rejected'

export type User = {
  id: string
  email: string
  fullName: string
  role: string
  status?: UserStatus
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  googleLogin: (credential: string) =>
    api.post('/auth/google', { credential }),
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}
