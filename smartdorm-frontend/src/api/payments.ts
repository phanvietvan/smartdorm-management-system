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
  getAll: (params?: { status?: string; billId?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; data: { payments: Payment[]; totalPages: number; currentPage: number; total: number } }>('/payments', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: Payment }>(`/payments/${id}`),
  create: (data: { billId: string; amount: number; method?: string; note?: string; evidenceImage?: string }) =>
    api.post<{ success: boolean; data: Payment }>('/payments', data),
  createVnpUrl: (data: { billId: string; amount: number; bankCode?: string; language?: string }) =>
    api.post<{ success: boolean; vnpUrl: string; data: { orderId: string } }>('/payments/vnpay/create-url', data),
  confirm: (id: string) => api.put<{ success: boolean; data: Payment }>(`/payments/${id}/confirm`),
}
