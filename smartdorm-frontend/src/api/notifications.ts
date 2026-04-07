import { api } from './client'

export type Notification = {
  _id: string
  userId: string
  type: 'bill' | 'maintenance' | 'payment' | 'visitor' | 'message' | 'rental' | 'broadcast' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  actor?: {
    userId: string | any
    fullName: string
    avatarUrl?: string
  }
  reactions: Array<{ userId: string; emoji: string }>
  metadata?: any
  createdAt: string
}

export const notificationsApi = {
  getAll: (params: { isRead?: boolean; type?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; data: Notification[]; pagination: any }>('/notifications', { params }),
  
  getUnreadCount: () => api.get<{ success: boolean; count: number }>('/notifications/unread-count'),
  
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  
  markAllRead: () => api.patch('/notifications/read-all'),
  
  toggleReaction: (id: string, emoji: string) => 
    api.post(`/notifications/${id}/reaction`, { emoji }),
  
  subscribePush: (subscription: any) => 
    api.post('/push/subscribe', { subscription }),
  
  unsubscribePush: (endpoint: string) => 
    api.delete('/push/unsubscribe', { data: { endpoint } }),

  createForUser: (data: { userId: string; title: string; message?: string; content?: string; type?: string; link?: string; metadata?: any }) => {
    // Treat 'content' as 'message' for backend compatibility
    const payload = { ...data, message: data.message || data.content }
    return api.post<{ success: boolean; data: Notification }>('/notifications', payload)
  },

  broadcast: (data: { title: string; content: string; type?: string; targetRole?: string; roomId?: string; link?: string; metadata?: any }) =>
    api.post('/notifications/broadcast', data)
}
