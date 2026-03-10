import { api } from './client'

export type Bill = {
  _id: string
  roomId: { _id: string; name: string; floor?: number }
  tenantId: { _id: string; fullName: string; email?: string; phone?: string }
  month: number
  year: number
  rentAmount: number
  electricityAmount: number
  waterAmount: number
  otherAmount?: number
  totalAmount: number
  status: string
  dueDate?: string
  note?: string
}

export const billsApi = {
  getAll: (params?: { month?: number; year?: number; status?: string; roomId?: string }) =>
    api.get<Bill[]>('/bills', { params }),
  getById: (id: string) => api.get<Bill>(`/bills/${id}`),
  create: (data: { roomId: string; tenantId: string; month: number; year: number; rentAmount?: number; prevElectricity?: number; currElectricity?: number; prevWater?: number; currWater?: number; otherAmount?: number; dueDate?: string; note?: string }) =>
    api.post<Bill>('/bills', data),
  update: (id: string, data: Partial<{ rentAmount: number; electricityAmount: number; waterAmount: number; otherAmount: number; status: string }>) =>
    api.put<Bill>(`/bills/${id}`, data),
}
