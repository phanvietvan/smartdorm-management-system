import { api } from './client'

export type Notification = {
  _id: string
  userId?: { _id: string; fullName: string }
  title: string
  content: string
  type: 'system' | 'bill' | 'maintenance' | 'contract' | 'general'
  isRead: boolean
  createdAt: string
}

export const notificationsApi = {
  getAll: (params?: { isRead?: boolean }) =>
    api.get<Notification[]>('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  broadcast: (data: { title: string; content: string; type?: string; targetRole?: string; roomId?: string }) =>
    api.post<Notification>('/notifications/broadcast', data),
}
