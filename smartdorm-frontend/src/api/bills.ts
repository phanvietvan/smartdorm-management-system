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

type CreateBillPayload = {
  roomId: string
  tenantId: string
  month: number
  year: number
  rentAmount?: number
  prevElectricity?: number
  currElectricity?: number
  prevWater?: number
  currWater?: number
  otherAmount?: number
  dueDate?: string
  note?: string
}

/** POST /bills: BE cần roomId, tenantId, month, year; BE tự gửi thông báo "Hóa đơn mới" cho tenantId. Gửi thêm prevElec/currElec nếu BE dùng tên đó. */
export const billsApi = {
  getAll: (params?: { month?: number; year?: number; status?: string; roomId?: string; tenantId?: string }) =>
    api.get<Bill[]>('/bills', { params }),
  getById: (id: string) => api.get<Bill>(`/bills/${id}`),
  create: (data: CreateBillPayload) => {
    const body: Record<string, unknown> = {
      roomId: data.roomId,
      tenantId: data.tenantId,
      month: data.month,
      year: data.year,
      rentAmount: data.rentAmount,
      prevWater: data.prevWater,
      currWater: data.currWater,
      prevElec: data.prevElectricity,
      currElec: data.currElectricity,
      otherAmount: data.otherAmount,
      dueDate: data.dueDate,
      note: data.note,
    }
    return api.post<Bill>('/bills', body)
  },
  update: (id: string, data: Partial<{ rentAmount: number; electricityAmount: number; waterAmount: number; otherAmount: number; status: string }>) =>
    api.put<Bill>(`/bills/${id}`, data),
}
