import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { servicesApi, type Service } from '../api/services'
import { maintenanceApi, type MaintenanceRequest } from '../api/maintenance'
import { useSocket } from '../hooks/useSocket'

export default function Services() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)
  const isGuest = user?.role === 'guest'
  const isTenant = user?.role === 'tenant'
  
  // States for Admin
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    unitPrice: 0,
    unit: '',
    description: ''
  })

  // States for Tenant Maintenance
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [mLoading, setMLoading] = useState(false)
  const [mError, setMError] = useState('')
  const [creating, setCreating] = useState(false)
  const [requestFormData, setRequestFormData] = useState({
    category: 'Hệ thống điện',
    urgency: 'Bình thường - Trong 24h',
    description: '',
    title: ''
  })

  const loadServices = async () => {
    try {
      setLoading(true)
      const res = await servicesApi.getAll()
      setServices(res.data)
    } catch (err: any) {
      setServiceError(err.response?.data?.message || 'Không thể tải danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  const loadMaintenance = async () => {
    if (!isTenant) return
    try {
      setMLoading(true)
      const res = await maintenanceApi.getAll() 
      // Hiển thị hầu hết các yêu cầu (trừ những mục đã hủy nếu bạn muốn lọc bớt) để cung cấp cái nhìn tổng quan
      const visible = res.data
        .filter(r => ['pending', 'in_progress', 'reopened', 'completed', 'closed'].includes(r.status))
        .slice(0, 3) // CHỈ LẤY 3 CÁI GẦN NHẤT
      setMaintenanceRequests(visible)
    } catch (err: any) {
      setMError(err.response?.data?.message || 'Lỗi tải lịch sử bảo trì')
    } finally {
      setMLoading(false)
    }
  }

  // Real-time update for maintenance list
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket || !isTenant) return
    
    // Khi có thông báo mới (đặc biệt là maintenance), load lại danh sách
    const handler = (newNote: any) => {
      if (newNote.type === 'maintenance') {
        loadMaintenance()
      }
    }

    socket.on('new_notification', handler)
    return () => { socket.off('new_notification', handler) }
  }, [socket, isTenant])

  useEffect(() => {
    if (isAdmin || isGuest) {
      loadServices()
    }
    if (isTenant) {
      loadMaintenance()
    }
  }, [user])

  // Handlers for Admin
  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingId(service._id)
      setServiceFormData({
        name: service.name,
        unitPrice: service.unitPrice,
        unit: service.unit,
        description: service.description || ''
      })
    } else {
      setEditingId(null)
      setServiceFormData({ name: '', unitPrice: 0, unit: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await servicesApi.update(editingId, serviceFormData)
      } else {
        await servicesApi.create(serviceFormData)
      }
      setIsModalOpen(false)
      loadServices()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi lưu dịch vụ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleServiceDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return
    try {
      await servicesApi.delete(id)
      loadServices()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa dịch vụ')
    }
  }

  // Handlers for Tenant Maintenance
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.roomId) {
      alert('Bạn chưa được gán phòng. Vui lòng liên hệ quản lý để đăng ký dịch vụ bảo trì.')
      return
    }
    if (!requestFormData.title || !requestFormData.description) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mô tả sự cố.')
      return
    }

    setCreating(true)
    try {
      const rId = typeof user.roomId === 'object' ? (user.roomId as any)._id : user.roomId
      await maintenanceApi.create({
        roomId: rId,
        title: requestFormData.title,
        description: requestFormData.description,
        category: requestFormData.category,
        urgency: requestFormData.urgency
      })
      alert('Gửi yêu cầu bảo trì thành công! Đội ngũ kỹ thuật sẽ sớm phản hồi.')
      setRequestFormData({ category: 'Hệ thống điện', urgency: 'Bình thường - Trong 24h', description: '', title: '' })
      loadMaintenance()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gửi yêu cầu')
    } finally {
      setCreating(false)
    }
  }

  // MAIN RENDER FOR TENANT (Editorial Canvas Style)
  if (isTenant) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-outline-variant/10 pb-8">
          <h2 className="text-4xl font-extrabold text-on-surface mb-2 tracking-tighter">Bảo trì & Hỗ trợ</h2>
          <p className="text-on-surface-variant max-w-2xl text-sm font-medium opacity-80">
            Quản lý không gian sống của bạn. Báo cáo các sự cố, theo dõi quá trình sửa chữa và nhận trợ giúp từ đội ngũ kỹ thuật 24/7.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* New Service Request Form (Left Column) */}
          <section className="lg:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_20px_50px_rgba(74,63,226,0.05)] border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl">add_task</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Yêu cầu dịch vụ mới</h3>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Mô tả sự cố để được trợ giúp</p>
              </div>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-8 relative z-10">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Tiêu đề sự cố</label>
                <input 
                  type="text"
                  required
                  value={requestFormData.title}
                  onChange={e => setRequestFormData({...requestFormData, title: e.target.value})}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-primary/10 text-sm font-bold text-on-surface transition-all placeholder:text-outline-variant" 
                  placeholder="VD: Vòi sen bị rò rỉ nước..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Hạng mục</label>
                  <select 
                    value={requestFormData.category}
                    onChange={e => setRequestFormData({...requestFormData, category: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-primary/10 text-sm font-bold text-on-surface transition-all"
                  >
                    <option>Hệ thống điện</option>
                    <option>Hệ thống nước</option>
                    <option>Điều hòa / HVAC</option>
                    <option>Nội thất / Mộc</option>
                    <option>Sửa chữa thiết bị</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Độ khẩn cấp</label>
                  <select 
                    value={requestFormData.urgency}
                    onChange={e => setRequestFormData({...requestFormData, urgency: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-primary/10 text-sm font-bold text-on-surface transition-all"
                  >
                    <option>Thấp - Trong 3 ngày</option>
                    <option>Bình thường - Trong 24h</option>
                    <option>Cao - Cần xử lý sớm</option>
                    <option>Khẩn cấp - Nguy hiểm</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Mô tả chi tiết</label>
                <textarea 
                  required
                  value={requestFormData.description}
                  onChange={e => setRequestFormData({...requestFormData, description: e.target.value})}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-5 px-6 focus:ring-4 focus:ring-primary/10 text-sm font-bold text-on-surface transition-all resize-none min-h-[140px] placeholder:text-outline-variant" 
                  placeholder="Hãy cho chúng tôi biết điều gì đang xảy ra..." 
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={creating}
                className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:brightness-110 hover:shadow-[0px_10px_30px_rgba(74,63,226,0.3)] transition-all transform active:scale-98 shadow-xl shadow-primary/20 disabled:bg-primary/50"
              >
                {creating ? 'Đang gửi...' : 'Xác nhận gửi yêu cầu'}
              </button>
            </form>
          </section>

          {/* Active Requests & FAQ (Right Column) */}
          <div className="lg:col-span-5 space-y-10">
            {/* Active Requests List */}
            <section className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_20px_50px_rgba(74,63,226,0.05)] border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8 border-b border-outline-variant/5 pb-4">
                <h3 className="font-extrabold text-xl tracking-tight">Yêu cầu đang xử lý</h3>
                <span className="text-[10px] font-black bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-widest">
                  {maintenanceRequests.length} Yêu cầu
                </span>
              </div>
              
              {mError && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center border border-rose-100">
                  {mError}
                </div>
              )}

              <div className="space-y-5">
                {mLoading ? (
                   <p className="text-center py-4 text-xs font-bold text-on-surface-variant animate-pulse">Đang tải lịch sử...</p>
                ) : maintenanceRequests.length === 0 ? (
                  <div className="py-12 text-center bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-surface-dim text-4xl mb-2">auto_awesome</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tất cả đều ổn!</p>
                  </div>
                ) : maintenanceRequests.map(req => {
                  const statusInfo: any = {
                    pending: { label: 'Chờ xử lý', color: 'text-outline-variant bg-surface-container-highest/50', icon: 'hourglass_top' },
                    in_progress: { label: 'Đang sửa', color: 'text-primary bg-primary-container/20', icon: 'construction' },
                    completed: { label: 'Hoàn thành', color: 'text-green-600 bg-green-50', icon: 'check_circle' },
                    cancelled: { label: 'Đã hủy', color: 'text-rose-500 bg-rose-50', icon: 'cancel' },
                    closed: { label: 'Đã đóng', color: 'text-slate-500 bg-slate-100', icon: 'lock_reset' },
                    reopened: { label: 'Mở lại', color: 'text-amber-600 bg-amber-50', icon: 'refresh' }
                  }
                  const st = statusInfo[req.status] || statusInfo.pending;
                  
                  return (
                    <div key={req._id} className="p-5 bg-surface-container-low rounded-2xl flex gap-5 hover:bg-surface-container-high hover:-translate-y-0.5 transition-all duration-300 group shadow-sm border border-outline-variant/5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-outline-variant/10 flex-shrink-0 ${st.color.split(' ')[1]}`}>
                        <span className={`material-symbols-outlined text-2xl ${st.color.split(' ')[0]}`}>{st.icon}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="font-extrabold text-[13px] text-on-surface tracking-tight truncate max-w-[140px] uppercase">{req.title}</p>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-on-surface-variant mt-1.5 line-clamp-2 opacity-70">
                           {req.category ? `${req.category} • ` : ''}{req.description || 'Đang cập nhật...'}
                        </p>
                        <p className="text-[9px] font-black text-outline uppercase tracking-widest mt-3 flex items-center gap-1.5 opacity-60">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          Gửi từ {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <button className="w-full mt-8 py-3 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5 rounded-xl transition-all border border-primary/10 tracking-widest">
                Xem toàn bộ lịch sử
              </button>
            </section>

            {/* Quick Help / FAQ */}
            <section className="bg-primary rounded-[2.5rem] p-8 text-on-primary shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <span className="material-symbols-outlined text-3xl opacity-90">quiz</span>
                <h3 className="font-black text-xl tracking-tight">Hỗ trợ nhanh</h3>
              </div>

              <div className="space-y-4 relative z-10">
                <details className="group/item bg-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors border border-white/10 outline-none">
                  <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-bold text-[12px] tracking-tight outline-none">
                    Mất chìa khóa phòng?
                    <span className="material-symbols-outlined text-xl group-open/item:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-5 pb-5 text-[11px] font-medium text-on-primary/70 leading-relaxed">
                    Vui lòng ghé Quầy lễ tân tại Sảnh từ 8:00 đến 22:00. Sau giờ hành chính, hãy dùng nút Chat Khẩn Cấp để liên hệ quản lý trực.
                  </div>
                </details>
                <details className="group/item bg-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors border border-white/10 outline-none">
                  <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-bold text-[12px] tracking-tight outline-none">
                    Sự cố kết nối WiFi?
                    <span className="material-symbols-outlined text-xl group-open/item:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-5 pb-5 text-[11px] font-medium text-on-primary/70 leading-relaxed">
                    Thử khởi động lại router trong phòng hoặc đăng nhập mạng 'SmartDorm_Secure' bằng ID người thuê đã được cấp.
                  </div>
                </details>
                <details className="group/item bg-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors border border-white/10 outline-none">
                  <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-bold text-[12px] tracking-tight outline-none">
                    Chính sách khách ghé thăm?
                    <span className="material-symbols-outlined text-xl group-open/item:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-5 pb-5 text-[11px] font-medium text-on-primary/70 leading-relaxed">
                    Khách được phép ở lại đến 23:00. Khách qua đêm phải được đăng ký trước 24h qua mục 'Phòng của tôi'.
                  </div>
                </details>
              </div>

              <div className="mt-10 p-5 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all relative z-10">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ưu tiên khẩn cấp</p>
                   <p className="font-extrabold text-sm tracking-tight mt-0.5">Trò chuyện với Concierge</p>
                 </div>
                 <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">support_agent</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // ADMIN VIEW (Original refined)
  if (isAdmin) {
    return (
      <div className="animate-in fade-in duration-500 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Bảng giá Dịch vụ & Cấu hình</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Quản lý định mức chi phí cho hệ thống hóa đơn tự động.</p>
          </div>
          <button 
            onClick={() => handleOpenServiceModal()}
            className="group px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
            Thêm Dịch Vụ Mới
          </button>
        </div>

        {serviceError && (
          <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold flex items-center gap-3">
             <span className="material-symbols-outlined text-lg">error</span>
             {serviceError}
          </div>
        )}

        {/* Admin Table Grid */}
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dịch vụ</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn Giá</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn vị tính</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả chi tiết</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 text-sm font-bold">
                      Chưa có hạng mục dịch vụ nào được cấu hình.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-800 text-sm">{service.name}</td>
                      <td className="px-8 py-6">
                        <span className="font-black text-indigo-600 font-mono text-base">
                          {new Intl.NumberFormat('vi-VN').format(service.unitPrice)} đ
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{service.unit}</td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-400 max-w-xs truncate">{service.description || '—'}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenServiceModal(service)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                             <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleServiceDelete(service._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                             <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Admin */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{editingId ? 'Cập nhật cấu hình' : 'Thiết lập dịch vụ mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              <form onSubmit={handleServiceSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên dịch vụ</label>
                  <input
                    type="text" required value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-body text-sm"
                    placeholder="VD: Điện năng tiêu thụ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Đơn giá (VND)</label>
                    <input
                      type="number" required min="0" value={serviceFormData.unitPrice}
                      onChange={(e) => setServiceFormData({...serviceFormData, unitPrice: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Đơn vị</label>
                    <input
                      type="text" required value={serviceFormData.unit}
                      onChange={(e) => setServiceFormData({...serviceFormData, unit: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-body text-sm"
                      placeholder="kWh, m3..."
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                    {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN LƯU THAY ĐỔI'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // GUEST VIEW
  return (
    <div className="animate-in fade-in duration-700 space-y-12 max-w-6xl mx-auto">
       <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Bảng giá Dịch vụ & Ưu đãi</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Khám phá các dịch vụ tiện ích cao cấp tại SmartDorm với chi phí minh bạch và hợp lý nhất.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <p className="text-center col-span-3">Đang tải...</p>
          ) : services.map(s => (
            <div key={s._id} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{s.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-indigo-600 tracking-tighter">{new Intl.NumberFormat('vi-VN').format(s.unitPrice)}đ</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ {s.unit}</span>
              </div>
              <p className="text-sm font-medium text-slate-500 leading-relaxed opacity-80">{s.description || 'Dịch vụ tiêu chuẩn với sự hỗ trợ kỹ thuật 24/7.'}</p>
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between group-hover:border-indigo-100 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Xem ưu đãi</span>
                <span className="material-symbols-outlined text-indigo-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
       </div>
    </div>
  )
}
