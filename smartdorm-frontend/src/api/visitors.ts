import { api } from './client'

export type Visitor = {
  _id: string
  name: string
  phone?: string
  roomId: { _id: string; name: string; floor?: number }
  tenantId: { _id: string; fullName: string }
  purpose?: string
  idCard?: string
  checkInAt: string
  checkOutAt?: string
}

export const visitorsApi = {
  getAll: (params?: { roomId?: string; checkedOut?: string }) =>
    api.get<Visitor[]>('/visitors', { params }),
  getById: (id: string) => api.get<Visitor>(`/visitors/${id}`),
  create: (data: { name: string; phone?: string; roomId: string; tenantId: string; purpose?: string; idCard?: string }) =>
    api.post<Visitor>('/visitors', data),
  checkout: (id: string) => api.put<Visitor>(`/visitors/${id}/checkout`),
}
