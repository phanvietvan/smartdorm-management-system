import { api } from './client'

export type DashboardStats = {
  rooms: { total: number; available: number; occupied: number }
  users: number
  bills: { total: number; paid: number; pending: number }
  revenue: number
  maintenance: { pending: number }
  visitors: { today: number }
}

export type RevenueReport = {
  year: number
  byMonth: { month: number; total: number; count: number }[]
  total: number
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getRevenue: (year?: number) => api.get<RevenueReport>('/dashboard/revenue', { params: { year } }),
}
