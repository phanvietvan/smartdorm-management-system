import { api } from './client'

export type ChatItem = {
  userId: string
  fullName: string
  lastMessage: string
  createdAt: string
  read: boolean
}

export type Message = {
  _id: string
  senderId: { _id: string; fullName: string }
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

export const messagesApi = {
  getChatList: () => api.get<ChatItem[]>('/messages/chat-list'),
  getConversation: (userId: string) => api.get<Message[]>(`/messages/conversation/${userId}`),
  send: (data: { receiverId: string; content: string }) =>
    api.post<Message>('/messages', data),
  markRead: (userId: string) => api.put(`/messages/read/${userId}`),
}
