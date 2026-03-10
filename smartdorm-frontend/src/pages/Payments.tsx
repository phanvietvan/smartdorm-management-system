import { useEffect, useState } from 'react'
import { paymentsApi, type Payment } from '../api/payments'
import { billsApi, type Bill } from '../api/bills'
import { uploadApi } from '../api/upload'
import { useAuth } from '../context/AuthContext'

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [form, setForm] = useState({ billId: '', amount: 0, method: 'cash' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const { user } = useAuth()
  const canConfirm = user?.role === 'accountant' || user?.role === 'admin' || user?.role === 'manager' || user?.role === 'landlord'
  const isTenant = user?.role === 'tenant'

  const load = () => {
    paymentsApi.getAll().then((r) => setPayments(r.data)).catch(() => setError('Không thể tải lịch sử thanh toán'))
    if (isTenant) billsApi.getAll({ status: 'pending' }).then((r) => setBills(r.data)).catch(() => {})
  }

  useEffect(() => {
    setLoading(true)
    paymentsApi.getAll().then((r) => setPayments(r.data)).catch(() => setError('Không thể tải lịch sử thanh toán')).finally(() => setLoading(false))
    if (isTenant) billsApi.getAll({ status: 'pending' }).then((r) => setBills(r.data)).catch(() => {})
  }, [isTenant])

  const handleConfirm = (id: string) => {
    if (!window.confirm('Xác nhận đã nhận được khoản thanh toán này?')) return
    setConfirmingId(id)
    paymentsApi.confirm(id).then(() => load()).catch(() => setError('Lỗi xác nhận thanh toán')).finally(() => setConfirmingId(null))
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.billId || !form.amount) return
    
    setSubmitting(true)
    setError('')
    
    try {
      if (form.method === 'vnpay') {
        const res = await paymentsApi.createVnpUrl({
          billId: form.billId,
          amount: form.amount,
          language: 'vn'
        })
        if (res.data?.vnpUrl) {
          window.location.href = res.data.vnpUrl
          return
        }
      }

      let evidenceUrl = undefined
      if (selectedFile) {
        const uploadRes = await uploadApi.uploadFile(selectedFile)
        evidenceUrl = uploadRes.data.fileUrl
      }

      await paymentsApi.create({ 
        billId: form.billId, 
        amount: form.amount, 
        method: form.method,
        evidenceImage: evidenceUrl 
      })
      
      load()
      setShowForm(false)
      setForm({ billId: '', amount: 0, method: 'cash' })
      setSelectedFile(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi gửi yêu cầu thanh toán')
    } finally {
      setSubmitting(false)
    }
  }

  const methodLabel: Record<string, string> = { cash: 'Tiền mặt', bank: 'Chuyển khoản', vnpay: 'VNPAY' }
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200/50',
    confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    rejected: 'bg-rose-50 text-rose-600 border-rose-200/50'
  }

  if (loading && payments.length === 0) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch sử thanh toán</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi các khoản thu tiền phòng và dịch vụ.
          </p>
        </div>
        {isTenant && bills.length > 0 && (
          <button
             onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
             className={`px-4 py-2.5 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${showForm ? 'bg-slate-400 hover:bg-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Hủy bỏ
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Báo cáo thanh toán
              </>
            )}
          </button>
        )}
      </div>

      {error && !showForm && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {/* Tenant Payment Form */}
      {showForm && isTenant && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transform origin-top transition-all">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">Gửi yêu cầu xác nhận thanh toán</h2>
          
          {error && <div className="p-3 mb-5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
          
          <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 text-sm lg:col-span-2">
              <label className="font-semibold text-slate-700">Chọn hóa đơn cần thanh toán <span className="text-rose-500">*</span></label>
              <select 
                value={form.billId} 
                onChange={(e) => {
                  const bill = bills.find((b) => b._id === e.target.value)
                  setForm({ ...form, billId: e.target.value, amount: bill?.totalAmount || 0 })
                }} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                <option value="">-- Chọn hóa đơn chưa thanh toán --</option>
                {bills.map((b) => (
                  <option key={b._id} value={b._id}>
                    Hóa đơn tháng {b.month}/{b.year} - {typeof b.roomId === 'object' ? b.roomId?.name : ''} - {(b.totalAmount || 0).toLocaleString('vi-VN')}₫
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Hình thức thanh toán <span className="text-rose-500">*</span></label>
              <select 
                value={form.method} 
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="vnpay">Tự động qua VNPAY</option>
                <option value="cash">Nộp tiền mặt</option>
              </select>
            </div>
            
            <div className="space-y-1.5 text-sm lg:col-span-3">
              <label className="font-semibold text-slate-700">Số tiền bạn đã thanh toán (VNĐ) <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                value={form.amount === 0 ? '' : form.amount} 
                onChange={(e) => setForm({ ...form, amount: +e.target.value || 0 })} 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xl font-bold text-indigo-700"
              />
              <p className="text-xs text-slate-500 mt-1">Vui lòng nhập chính xác số tiền bạn đã chuyển khoản hoặc nộp tiền mặt.</p>
            </div>
            <div className="space-y-1.5 text-sm lg:col-span-3">
              <label className="font-semibold text-slate-700">Hình ảnh minh chứng (Biên lai / Bill chuyển khoản)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                disabled={form.method === 'vnpay'}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all text-slate-600 disabled:opacity-50"
              />
              {form.method === 'vnpay' && (
                <p className="text-xs text-indigo-600 font-medium">Bạn sẽ được chuyển hướng tới cổng thanh toán VNPAY, không cần tải lên minh chứng.</p>
              )}
            </div>
            
            <div className="lg:col-span-3 flex justify-end pt-4 mt-2 border-t border-slate-100">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting || !form.billId || !form.amount}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </>
                ) : (form.method === 'vnpay' ? 'Thanh toán qua VNPAY' : 'Báo cáo đã thanh toán')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin hóa đơn</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người nộp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Số tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hình thức</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày báo cáo</th>
                {canConfirm && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={canConfirm ? 7 : 6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm3-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Không có giao dịch thanh toán nào</h3>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const billInfo = typeof p.billId === 'object' && p.billId ? p.billId as any : null;
                  
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {billInfo ? `Hóa đơn tháng ${billInfo.month}/${billInfo.year}` : 'Không xác định'}
                        </div>
                        {billInfo && <div className="text-xs text-slate-400 font-mono mt-0.5">#{billInfo._id?.slice(-6).toUpperCase()}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{typeof p.tenantId === 'object' ? p.tenantId?.fullName : '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-indigo-600 text-sm">
                          {p.amount?.toLocaleString('vi-VN')}₫
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                          {p.method === 'bank' ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          )}
                          {methodLabel[p.method] || p.method}
                        </div>
                        {p.evidenceImage && (
                          <a href={p.evidenceImage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            Xem biên lai
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>
                          {p.status === 'confirmed' ? 'Đã duyệt' : p.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      
                      {canConfirm && (
                        <td className="px-6 py-4 text-right">
                          {p.status === 'pending' ? (
                            <button 
                              onClick={() => handleConfirm(p._id)}
                              disabled={confirmingId === p._id}
                              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                            >
                              {confirmingId === p._id ? 'Xử lý...' : 'Xác nhận thu'}
                            </button>
                          ) : (
                            <span className="text-sm font-medium text-slate-400 italic">Đã xử lý</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
