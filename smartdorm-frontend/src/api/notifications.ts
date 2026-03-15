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

/**
 * GET /notifications: BE trả { success: true, data: [ ... ] }.
 * Axios res.data = body → list = res.data.data (lịch sử tất cả thông báo từ DB).
 */
function parseNotificationList(res: any): Notification[] {
  const body = res?.data
  if (Array.isArray(body)) return body
  const list = body?.data ?? body?.notifications ?? body?.list ?? body?.items ?? body?.result
  if (Array.isArray(list)) return list
  return []
}

export type CreateNotificationPayload = {
  userId: string
  title: string
  content: string
  type?: 'system' | 'bill' | 'maintenance' | 'contract' | 'general'
}

export const notificationsApi = {
  getAll: async (params?: { isRead?: boolean; limit?: number }) => {
    const query: Record<string, string | number | boolean> = {}
    if (params?.isRead !== undefined) {
      query.isRead = params.isRead
      query.read = params.isRead
    }
    if (params?.limit != null) query.limit = params.limit
    const res = await api.get('/notifications', { params: query })
    return { ...res, data: parseNotificationList(res) }
  },
  create: (data: CreateNotificationPayload) =>
    api.post<Notification>('/notifications', data),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  broadcast: (data: { title: string; content: string; type?: string; targetRole?: string; roomId?: string }) =>
    api.post<Notification>('/notifications/broadcast', data),
  createForUser: (data: { userId: string; title: string; content: string; type?: Notification['type'] }) =>
    api.post<Notification>('/notifications', data),
}
