import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { servicesApi, type Service } from '../api/services'

export default function Services() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)
  
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    unitPrice: 0,
    unit: '',
    description: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await servicesApi.getAll()
      setServices(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service._id)
      setFormData({
        name: service.name,
        unitPrice: service.unitPrice,
        unit: service.unit,
        description: service.description || ''
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', unitPrice: 0, unit: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await servicesApi.update(editingId, formData)
      } else {
        await servicesApi.create(formData)
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi lưu dịch vụ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này? (Có thể ảnh hưởng đến việc tự động tính hóa đơn)')) return
    
    try {
      await servicesApi.delete(id)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa dịch vụ')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>

  // If not admin, just show a plain read-only list
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bảng Giá Dịch Vụ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <h3 className="text-lg font-bold text-slate-800">{s.name}</h3>
              <div className="text-2xl font-black text-indigo-600 mb-2">
                {new Intl.NumberFormat('vi-VN').format(s.unitPrice)} ₫ <span className="text-sm font-medium text-slate-500">/ {s.unit}</span>
              </div>
              {s.description && <p className="text-sm text-slate-600">{s.description}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cấu hình Dịch vụ & Bảng giá</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các loại phí dịch vụ cho việc tự động tính toán hóa đơn</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Thêm Dịch Vụ Mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên Dịch Vụ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn Giá</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn Vị Tính</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mô Tả</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Chưa có dịch vụ nào được định nghĩa.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{service.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-indigo-600 font-mono">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.unitPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {service.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {service.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                        title="Sửa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors hover:cursor-pointer"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Creating/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Cập nhật Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên Dịch Vụ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  placeholder="VD: Điện, Nước, Wifi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đơn Giá (VNĐ) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                    placeholder="3500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đơn Vị Tính <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                    placeholder="VD: kWh, m3, Tháng..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả (Tùy chọn)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 resize-none"
                  placeholder="Mô tả dịch vụ..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu dịch vụ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
