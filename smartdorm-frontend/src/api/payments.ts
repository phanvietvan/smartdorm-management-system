import { api } from './client'

export type Payment = {
  _id: string
  billId: { _id: string; totalAmount?: number; month?: number; year?: number }
  tenantId: { _id: string; fullName: string; email?: string }
  amount: number
  method: string
  status: string
  evidenceImage?: string
  confirmedBy?: { fullName: string }
  confirmedAt?: string
  createdAt: string
}

export const paymentsApi = {
  getAll: (params?: { status?: string; billId?: string }) =>
    api.get<Payment[]>('/payments', { params }),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
  create: (data: { billId: string; amount: number; method?: string; note?: string; evidenceImage?: string }) =>
    api.post<Payment>('/payments', data),
  createVnpUrl: (data: { billId: string; amount: number; bankCode?: string; language?: string }) =>
    api.post<{ vnpUrl: string }>('/payments/vnpay/create-url', data),
  confirm: (id: string) => api.put<Payment>(`/payments/${id}/confirm`),
}
