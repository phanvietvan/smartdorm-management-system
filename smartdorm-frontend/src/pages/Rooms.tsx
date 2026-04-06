import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { areasApi, type Area } from '../api/areas'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import SuccessScreen from '../components/SuccessScreen'
import { rentalApi } from '../api/rentalRequests'
import { maintenanceApi } from '../api/maintenance'

type EquipmentInput = {
  name: string
  status: string
  quantity: number
}

const ROOM_CREATOR_ROLES = ['admin', 'manager', 'landlord']

export default function Rooms() {
  const { user } = useAuth()
  const isGuest = user?.role === 'guest'
  const isTenant = user?.role === 'tenant'
  const canCreate = user ? ROOM_CREATOR_ROLES.includes(user.role) : false

  // Flexible Room ID extraction
  const myRoomId = typeof user?.roomId === 'object' ? user?.roomId?._id : user?.roomId

  const [rooms, setRooms] = useState<Room[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [tenants, setTenants] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', floor: 1, capacity: 1, price: 0, status: 'available', areaId: '', amenities: '', tenantId: '', contactPhone: '' })
  const [newAmenity, setNewAmenity] = useState('')
  const [equipments, setEquipments] = useState<EquipmentInput[]>([])
  const [formError, setFormError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [rentalForm, setRentalForm] = useState({ fullName: '', phone: '', email: '', message: '' })
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  
  // Tenant Specific States
  const [roommates, setRoommates] = useState<User[]>([])
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([])

  useEffect(() => {
    if (showRentalModal && user) {
      setRentalForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        message: ''
      })
    }
  }, [showRentalModal, user])

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return
    setSendingRequest(true)
    try {
      await rentalApi.create({ ...rentalForm, roomId: selectedRoom._id })
      setRequestSuccess(true)
      setRentalForm({ fullName: '', phone: '', email: '', message: '' })
      setTimeout(() => {
        setShowRentalModal(false)
        setRequestSuccess(false)
      }, 2000)
    } catch (err) {
      alert('Không thể gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setSendingRequest(false)
    }
  }

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchTerm(query)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        if (isTenant) {
          try {
            const [roomRes, roommatesRes, maintenanceRes] = await Promise.all([
              roomsApi.getMyRoom(),
              usersApi.getRoommates(),
              maintenanceApi.getAll({ roomId: myRoomId })
            ])
            setRooms([roomRes.data])
            setRoommates(roommatesRes.data)
            setMaintenanceHistory(maintenanceRes.data)
          } catch (fetchErr) {
            setRooms([])
            setRoommates([])
            setMaintenanceHistory([])
          }
          setAreas([])
          setTenants([])
        } else if (isGuest) {
          const [roomsRes, areasRes] = await Promise.all([
            roomsApi.getAvailable(),
            areasApi.getAll()
          ])
          setRooms(roomsRes.data)
          setAreas(areasRes.data)
          setTenants([])
        } else {
          const [roomsRes, areasRes, usersRes] = await Promise.all([
            roomsApi.getAll(),
            areasApi.getAll(),
            usersApi.getAll()
          ])
          setRooms(roomsRes.data)
          setAreas(areasRes.data)
          setTenants(usersRes.data)
          if (!form.areaId && areasRes.data.length) {
            setForm((prev) => ({ ...prev, areaId: areasRes.data[0]._id }))
          }
        }
      } catch (err) {
        setError('Không thể tải danh sách phòng hoặc khu nhà')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isGuest, isTenant, user?.roomId])

  const resetForm = () => {
    setForm((prev) => ({
      name: '',
      floor: 1,
      capacity: 1,
      price: 0,
      status: 'available',
      areaId: prev.areaId || (areas[0]?._id ?? ''),
      amenities: '',
      tenantId: '',
      contactPhone: ''
    }))
    setEquipments([])
    setFormError('')
    setNewAmenity('')
  }


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!canCreate) return
    if (!form.name.trim() || !form.areaId) {
      setFormError('Vui lòng điền đủ thông tin bắt buộc')
      return
    }

    setCreating(true)
    try {
      const { tenantId, ...roomData } = form
      const payload = { ...roomData, equipments }
      const { data: newRoom } = await roomsApi.create(payload)
      
      if (tenantId) {
        await usersApi.assignTenant({ userId: tenantId, roomId: newRoom._id })
        newRoom.status = 'occupied'
      }

      setRooms((prev) => [newRoom, ...prev])
      resetForm()
      setShowForm(false)
      setShowSuccess(true)
      if (tenantId) {
        const usersRes = await usersApi.getAll()
        setTenants(usersRes.data)
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Không thể thêm phòng mới')
    } finally {
      setCreating(false)
    }
  }

  const filteredRooms = rooms.filter(r => {
    if (!searchTerm) return true
    const query = searchTerm.toLowerCase()
    
    const nameMatch = r.name.toLowerCase().includes(query)
    const floorMatch = r.floor.toString().includes(query)
    const statusMatch = (r.status === 'available' ? 'có sẵn trống' : 'đã thuê occupied').includes(query)
    
    // Check area name
    let areaMatch = false
    if (typeof r.areaId === 'object') {
      areaMatch = (r.areaId as any)?.name?.toLowerCase().includes(query)
    } else {
      const area = areas.find(a => a._id === r.areaId)
      areaMatch = area?.name?.toLowerCase().includes(query) || false
    }

    return nameMatch || floorMatch || statusMatch || areaMatch
  })

  if (loading) return (
    <div className="flex items-center justify-center p-12 text-slate-500 font-medium">Đang tải dữ liệu...</div>
  )
  if (error) return <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">{error}</div>

  if (showSuccess) {
    return (
      <SuccessScreen
        message="Thêm phòng thành công!"
        onDone={() => setShowSuccess(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--sd-surface)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-16">
        {/* Header Section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="h-[3px] w-14 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></span>
              <span className="text-indigo-600/90 text-[11px] font-bold uppercase tracking-[0.35em] letter-spacing-wide">
                SmartDorm Residence
              </span>
            </div>
            <h1 className={`font-bold tracking-tight leading-[1.1] text-slate-900 ${isTenant ? 'text-4xl sm:text-5xl md:text-6xl room-luxury-title' : 'text-5xl md:text-6xl'}`}>
              {isTenant ? 'Phòng của tôi' : isGuest ? 'Phòng Trống' : 'Quản Lý Phòng'}
            </h1>
            <p className="text-slate-500 font-medium text-sm tracking-[0.12em]">
              {isTenant ? 'Chi tiết không gian sống cao cấp của bạn' : isGuest ? 'Khám phá các lựa chọn phòng ở thượng lưu' : `Hệ thống vận hành: Tổng số ${rooms.length} phòng`}
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className={`group relative px-10 py-5 rounded-full font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden shadow-xl flex items-center gap-4 ${
                showForm ? 'bg-slate-400 text-white shadow-slate-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
              }`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span>{showForm ? 'Hủy Cấu Hình' : 'Khởi Tạo Phòng Mới'}</span>
              <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 ${showForm ? 'rotate-45' : 'group-hover:rotate-180'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              </div>
            </button>
          )}
        </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cấu hình phòng mới</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thiết lập thông số cho không gian sống</p>
             </div>
          </div>

          {formError && <div className="p-4 mb-8 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 shadow-sm flex items-center gap-3">
             <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center flex-shrink-0">!</div>
             {formError}
          </div>}
          
          <form onSubmit={handleCreate} className="space-y-10 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khu nhà đại diện</label>
                <select
                  value={form.areaId}
                  onChange={(e) => setForm((prev) => ({ ...prev, areaId: e.target.value }))}
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none appearance-none"
                >
                  <option value="">Chọn khu nhà...</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>{area.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Định danh phòng</label>
                <input
                  placeholder="Ví dụ: P.101, Suite A"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tầng số</label>
                <input type="number" value={form.floor} min={1} onChange={(e) => setForm((prev) => ({ ...prev, floor: Number(e.target.value) }))} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sức chứa</label>
                <input type="number" value={form.capacity} min={1} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Định giá (VNĐ/tháng)</label>
                <input type="number" value={form.price} min={0} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none tabular-nums" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Người thuê (Gán ngay)</label>
                <select
                  value={form.tenantId}
                  onChange={(e) => setForm(prev => ({ ...prev, tenantId: e.target.value }))}
                  className="w-full px-6 py-4 bg-indigo-50/30 border border-indigo-100/50 rounded-[1.5rem] font-bold text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                >
                  <option value="">-- Chưa gán --</option>
                  {tenants
                    .filter(t => t.role === 'guest' && (t as any).status === 'approved' && !t.roomId)
                    .map(t => (
                      <option key={t._id} value={t._id}>{t.fullName}</option>
                    ))
                  }
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SĐT Liên hệ (Người cho thuê)</label>
                <input 
                  placeholder="09xxx..." 
                  value={form.contactPhone} 
                  onChange={(e) => setForm(prev => ({ ...prev, contactPhone: e.target.value }))} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none" 
                />
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
              {/* Amenities Section - Text Area */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiện ích trải nghiệm & Mô tả chi tiết</label>
                <textarea 
                  placeholder="VD: Wifi 5G, Ban công, Tủ lạnh, hướng ánh sáng, nội thất đặc trưng..."
                  value={form.amenities}
                  onChange={(e) => setForm(prev => ({ ...prev, amenities: e.target.value }))}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all outline-none resize-none"
                  rows={4}
                />
              </div>

              {/* Equipments Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục tài sản & thiết bị</label>
                  <button
                    type="button"
                    onClick={() => setEquipments(prev => [...prev, { name: '', status: 'good', quantity: 1 }])}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                  >
                    + Thêm thiết bị
                  </button>
                </div>
                
                <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {equipments.map((eq, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 group/eq hover:bg-white transition-all">
                      <input
                        placeholder="Tên thiết bị..."
                        value={eq.name}
                        onChange={(e) => {
                          const newEqs = [...equipments]
                          newEqs[idx].name = e.target.value
                          setEquipments(newEqs)
                        }}
                        className="flex-1 bg-transparent px-3 py-1 font-bold text-slate-700 outline-none"
                        required
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="number" min={1} value={eq.quantity}
                          onChange={(e) => {
                            const newEqs = [...equipments]
                            newEqs[idx].quantity = Number(e.target.value) || 1
                            setEquipments(newEqs)
                          }}
                          className="w-12 text-center bg-white border border-slate-100 rounded-lg py-1 font-black text-xs text-indigo-600 tabular-nums"
                        />
                        <select
                          value={eq.status}
                          onChange={(e) => {
                            const newEqs = [...equipments]
                            newEqs[idx].status = e.target.value
                            setEquipments(newEqs)
                          }}
                          className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-500 outline-none"
                        >
                          <option value="good">Tốt</option>
                          <option value="damaged">Hỏng</option>
                          <option value="maintenance">Bảo trì</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setEquipments(prev => prev.filter((_, i) => i !== idx))}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {equipments.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem]">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Danh mục đang trống</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button 
                type="submit" 
                className="group relative px-12 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-lg shadow-indigo-200/50 overflow-hidden transition-all hover:bg-indigo-700 hover:shadow-indigo-200/60 active:scale-[0.98]" 
                disabled={creating}
              >
                <span className="relative z-10">{creating ? 'Đang thực thi...' : 'Xác nhận Lưu Phòng'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

        {/* TENANT "MY ROOM" - REFINED WITH USER COLOR PALETTE & VIETNAMESE LOCALIZATION */}
        {isTenant ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-12">
            {rooms.length > 0 ? (
              rooms.map(r => (
                <div key={r._id} className="space-y-12 pb-20">
                  {/* Hero Header Section */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-8">
                      <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-2">Không gian sống của bạn</span>
                      <h1 className="text-5xl font-extrabold text-on-surface mt-2 leading-tight tracking-tight">
                        Phòng {r.name} — {typeof r.areaId === 'object' ? (r.areaId as any)?.name : 'Cơ sở chính'}
                      </h1>
                      <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-surface-container-lowest px-5 py-3 rounded-xl shadow-sm flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-xl">door_front</span>
                          <div>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Loại phòng</p>
                            <p className="font-semibold text-on-surface">{r.capacity === 3 ? 'Phòng Cao Cấp 3' : 'Phòng Tiêu Chuẩn'}</p>
                          </div>
                        </div>
                        <div className="bg-surface-container-lowest px-5 py-3 rounded-xl shadow-sm flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-xl">layers</span>
                          <div>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Vị trí tầng</p>
                            <p className="font-semibold text-on-surface">Tầng {r.floor}</p>
                          </div>
                        </div>
                        <div className="bg-surface-container-lowest px-5 py-3 rounded-xl shadow-sm flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-xl">architecture</span>
                          <div>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Diện tích</p>
                            <p className="font-semibold text-on-surface">42m²</p>
                          </div>
                        </div>
                        {r.amenities && (
                          <div className="bg-surface-container-lowest px-6 py-4 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4">
                            <span className="material-symbols-outlined text-primary text-2xl mt-1">auto_awesome</span>
                            <div>
                               <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1 opacity-60">Tiện ích & Mô tả không gian</p>
                               <p className="text-sm font-semibold text-on-surface leading-relaxed italic">
                                  {r.amenities}
                               </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="lg:col-span-4 flex flex-col gap-3">
                      <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-[0px_10px_30px_rgba(74,63,226,0.2)] hover:scale-[1.02] transition-transform">
                        <span className="material-symbols-outlined text-xl">vpn_key</span>
                        Mở Khóa Kỹ Thuật Số
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-surface-container-lowest text-on-surface py-3 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                          Yêu cầu sửa chữa
                        </button>
                        <button className="bg-surface-container-lowest text-on-surface py-3 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-primary text-xl">person_add</span>
                          Đăng ký khách
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Main Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Roommates Bento Card */}
                    <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm overflow-hidden relative">
                      <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3 border-b border-outline-variant/10 pb-4">
                        <span className="material-symbols-outlined text-primary">group</span>
                        Bạn cùng phòng
                      </h2>
                      <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                               {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user?.fullName?.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-on-surface leading-tight text-sm">{user?.fullName}</p>
                               <p className="text-[10px] text-on-surface-variant font-medium">Người thuê chính</p>
                            </div>
                          </div>
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Online</span>
                        </div>

                        {roommates.length > 0 ? roommates.map(mate => (
                          <div key={mate._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold overflow-hidden shadow-sm">
                                  {mate.avatarUrl ? <img src={mate.avatarUrl} className="w-full h-full object-cover" /> : (mate.fullName?.charAt(0) || '?')}
                               </div>
                               <div>
                                  <p className="font-bold text-on-surface leading-tight text-sm">{mate.fullName}</p>
                                  <p className="text-[10px] text-on-surface-variant font-medium">Bạn cùng phòng</p>
                               </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${mate.status === 'approved' ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                              {mate.status === 'approved' ? 'Đã duyệt' : 'Offline'}
                            </span>
                          </div>
                        )) : (
                          <>
                            <div className="flex items-center justify-between opacity-50 grayscale">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm">E</div>
                                 <div>
                                    <p className="font-bold text-on-surface text-sm">Elena V.</p>
                                    <p className="text-[10px] text-on-surface-variant font-medium">Ngành Kiến trúc</p>
                                 </div>
                              </div>
                              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Lên lớp</span>
                            </div>
                            <div className="flex items-center justify-between opacity-50 grayscale">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm">M</div>
                                 <div>
                                    <p className="font-bold text-on-surface text-sm">Marcus K.</p>
                                    <p className="text-[10px] text-on-surface-variant font-medium">Công nghệ thông tin</p>
                                 </div>
                              </div>
                              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Thư viện</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-8 pt-6 border-t border-outline-variant/10">
                        <button className="w-full text-primary font-bold text-[11px] flex items-center justify-center gap-2 group uppercase tracking-widest">
                          Dòng chat chung
                          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    {/* Agreement & Context Bento Card */}
                    <div className="md:col-span-8 flex flex-col gap-8">
                      {/* Agreement Summary */}
                      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/5">
                        <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">description</span>
                          Tóm tắt hợp đồng
                        </h2>
                        <div className="overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="border-b border-outline-variant/10">
                              <tr className="text-[10px] text-on-surface-variant font-extrabold uppercase tracking-widest">
                                <th className="pb-4">Hạng mục hợp đồng</th>
                                <th className="pb-4">Thông tin chi tiết</th>
                                <th className="pb-4">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-surface-container-low transition-colors group">
                                <td className="py-5 flex items-center gap-3 text-sm font-semibold text-on-surface">
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:scale-110 transition-transform">calendar_today</span>
                                  Thời hạn thuê
                                </td>
                                <td className="py-5 text-sm text-on-surface-variant font-medium text-slate-500">T8 2023 - T7 2024</td>
                                <td className="py-5"><span className="text-primary font-bold text-xs">Hiệu lực</span></td>
                              </tr>
                              <tr className="hover:bg-surface-container-low transition-colors group">
                                <td className="py-5 flex items-center gap-3 text-sm font-semibold text-on-surface">
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:scale-110 transition-transform">payments</span>
                                  Tiền thuê tháng
                                </td>
                                <td className="py-5 text-sm font-bold text-on-surface">{r.price?.toLocaleString('vi-VN')} VND / người</td>
                                <td className="py-5"><span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[9px] font-bold uppercase">Đã đóng</span></td>
                              </tr>
                              <tr className="hover:bg-surface-container-low transition-colors group">
                                <td className="py-5 flex items-center gap-3 text-sm font-semibold text-on-surface">
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:scale-110 transition-transform">verified_user</span>
                                  Tiền cọc ký quỹ
                                </td>
                                <td className="py-5 text-sm text-slate-500 font-medium">{((r.price || 0) * 2)?.toLocaleString('vi-VN')} VND (Ký quỹ)</td>
                                <td className="py-5"><span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[9px] font-bold uppercase">Ủy thác</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Room Rules */}
                        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border-l-4 border-tertiary">
                          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3 text-tertiary">
                             <span className="material-symbols-outlined">gavel</span>
                             Nội quy phòng
                          </h2>
                          <ul className="space-y-5">
                            <li className="flex items-start gap-4 group">
                               <span className="material-symbols-outlined text-sm mt-1 text-on-surface-variant transition-transform group-hover:scale-125">info</span>
                               <span className="text-[13px] font-semibold text-on-surface leading-relaxed">Giờ yên tĩnh từ 22:00 PM đến 07:00 AM.</span>
                            </li>
                            <li className="flex items-start gap-4 group">
                               <span className="material-symbols-outlined text-sm mt-1 text-on-surface-variant transition-transform group-hover:scale-125">cleaning_services</span>
                               <span className="text-[13px] font-semibold text-on-surface leading-relaxed">Tổng vệ sinh định kỳ 2 tuần/lần theo lịch.</span>
                            </li>
                            <li className="flex items-start gap-4 group">
                               <span className="material-symbols-outlined text-sm mt-1 text-on-surface-variant transition-transform group-hover:scale-125">group_add</span>
                               <span className="text-[13px] font-semibold text-on-surface leading-relaxed">Khách qua đêm không quá 2 đêm/tuần.</span>
                            </li>
                          </ul>
                        </div>
                        {/* 3D View / Map Placeholder */}
                        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group cursor-pointer relative h-full min-h-[180px]">
                          <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform">
                            <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-80 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">location_on</span>
                              Phối cảnh vị trí
                            </p>
                            <p className="font-extrabold text-xl tracking-tight">Hướng Nhìn Phố Bắc</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="material-symbols-outlined text-sm">visibility</span>
                               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Xem mô phỏng 3D</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipments Bento Card */}
                  {r.equipments && r.equipments.length > 0 && (
                    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/5">
                      <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                        Danh mục tài sản & Thiết bị
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {r.equipments.map((eq, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-surface-container-high transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${eq.status === 'good' ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/20 text-error'}`}>
                                <span className="material-symbols-outlined text-xl">{eq.status === 'good' ? 'task_alt' : 'warning'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-on-surface">{eq.name}</p>
                                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                                  {eq.status === 'good' ? 'Tốt' : eq.status === 'damaged' ? 'Hỏng' : 'Bảo trì'}
                                </p>
                              </div>
                            </div>
                            <span className="bg-surface-container-lowest px-2.5 py-1 rounded-lg text-xs font-black text-primary border border-outline-variant/10">x{eq.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maintenance History section */}
                  <section className="bg-surface-container-low rounded-[2.5rem] p-8 border border-outline-variant/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight text-on-surface">Lịch sử thiết bị</h2>
                        <p className="text-on-surface-variant font-medium text-sm mt-1">Các yêu cầu bảo trì và can thiệp kỹ thuật cho phòng {r.name}.</p>
                      </div>
                      <button className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Xem tất cả hồ sơ
                      </button>
                    </div>
                    <div className="space-y-5">
                      {maintenanceHistory.length > 0 ? maintenanceHistory.map(req => (
                        <div key={req._id} className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${req.status === 'completed' || req.status === 'closed' ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/20 text-error'}`}>
                              <span className="material-symbols-outlined text-3xl">{req.status === 'completed' || req.status === 'closed' ? 'router' : 'ac_unit'}</span>
                            </div>
                            <div>
                               <h3 className="font-bold text-lg text-on-surface leading-tight">{req.title}</h3>
                               <p className="text-sm font-medium text-on-surface-variant mt-0.5">{req.status === 'completed' || req.status === 'closed' ? 'Hoàn thành bởi Kỹ thuật SmartDorm' : `Đề xuất bởi ${user?.fullName}`}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                               <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Ngày</p>
                               <p className="font-bold text-on-surface text-sm">{new Date(req.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <span className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'completed' || req.status === 'closed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                              {req.status === 'completed' || req.status === 'closed' ? 'THÀNH CÔNG' : 'ĐANG XỬ LÝ'}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="bg-surface-container-lowest p-16 rounded-3xl text-center border-2 border-dashed border-outline-variant/20">
                           <p className="text-on-surface-variant font-bold text-sm tracking-wide">Chưa có lịch sử bảo trì liên quan.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ))
            ) : (
                <div className="py-32 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center text-center space-y-8 shadow-sm">
                  <div className="w-24 h-24 rounded-3xl bg-surface-container-low flex items-center justify-center text-on-surface-variant opacity-20 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-5xl">vpn_key</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-on-surface tracking-tight">Đang chờ nhận phòng...</h3>
                    <p className="text-on-surface-variant font-bold max-w-sm mx-auto text-sm">Hợp đồng của bạn đang được xử lý hoặc chờ bàn giao phòng.</p>
                  </div>
                </div>
            )}
            {/* FAB cho các hành động nhanh */}
            <button className="fixed bottom-12 right-12 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0px_15px_40px_rgba(74,63,226,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </button>
          </div>
        ) : isGuest ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRooms.map((r) => (
              <div key={r._id} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-[0.3em] mb-2">
                      {typeof r.areaId === 'object' ? (r.areaId as any)?.name : 'Cơ sở'}
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tightest">Phòng {r.name}</h3>
                  </div>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border border-emerald-100/50">Phòng Trống</span>
                </div>

                <div className="flex gap-4 mb-8">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-lg">layers</span>
                    <span className="text-[11px] font-bold text-slate-600">Tầng {r.floor}</span>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-lg">group</span>
                    <span className="text-[11px] font-bold text-slate-600">{r.capacity} Người</span>
                  </div>
                </div>

                {r.amenities && (
                  <div className="mb-8">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Thông tin tiện ích</p>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                      {r.amenities}
                    </p>
                  </div>
                )}

                {r.equipments && r.equipments.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Trang thiết bị</p>
                    <div className="grid grid-cols-2 gap-2">
                      {r.equipments.map((eq, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-dotted border-slate-200">
                          <span className="text-[10px] font-bold text-slate-600 truncate mr-2">{eq.name}</span>
                          <span className="text-[9px] font-black text-indigo-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">x{eq.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Giá tháng</p>
                    <p className="text-2xl font-extrabold text-indigo-600 tracking-tightest">{r.price?.toLocaleString()} ₫</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-extrabold text-slate-400 italic flex-1 text-right uppercase tracking-wider leading-relaxed">
                    SĐT: {r.contactPhone || 'Quản lý'}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => { setSelectedRoom(r); setShowRentalModal(true); }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                  >
                    Gửi yêu cầu thuê
                  </button>
                </div>
              </div>
            ))}
            {filteredRooms.length === 0 && (
              <div className="col-span-full py-32 bg-white rounded-[3rem] border border-dashed border-slate-100 text-center shadow-sm">
                 <p className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em]">Hiện tại không có phòng trống nào khả dụng</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/20 border border-slate-100/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-50">
                    <th className="px-10 py-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">Phòng</th>
                    <th className="px-10 py-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] text-right">Giá thuê</th>
                    <th className="px-10 py-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">Người thuê</th>
                    <th className="px-10 py-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">Trạng thái</th>
                    <th className="px-10 py-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRooms.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="px-10 py-8">
                        <div>
                          <p className="font-extrabold text-slate-900 tracking-tight text-lg">{r.name}</p>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Tầng {r.floor}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right font-extrabold text-indigo-600 text-lg tabular-nums tracking-tight">{r.price?.toLocaleString()} ₫</td>
                      <td className="px-10 py-8">
                        {r.status === 'occupied' ? (
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-lg shadow-indigo-100">
                                {tenants.find(t => t.roomId === r._id || (t.roomId as any)?._id === r._id)?.fullName.charAt(0).toUpperCase() || '?'}
                             </div>
                             <span className="text-sm font-extrabold text-slate-700 tracking-tight">
                                {tenants.find(t => t.roomId === r._id || (t.roomId as any)?._id === r._id)?.fullName || 'Đã gán'}
                             </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-extrabold text-[10px] uppercase tracking-[0.3em]">Trống</span>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-5 py-2 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                          r.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {r.status === 'available' ? 'Có sẵn' : 'Đã thuê'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Link to={`/app/rooms/${r._id}`} className="inline-flex items-center gap-3 text-[10px] font-extrabold text-slate-900 hover:text-indigo-600 transition-colors group/link bg-slate-50 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 hover:bg-white hover:border-indigo-100">
                          CHI TIẾT
                          <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rental Request Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setShowRentalModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              {requestSuccess ? (
                <div className="text-center py-10 space-y-6 animate-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">Yêu cầu đã được gửi!</h3>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chúng tôi sẽ liên hệ sớm nhất</p>
                </div>
              ) : (
                <form onSubmit={handleRentalSubmit} className="space-y-8">
                   <div className="space-y-2 text-center pb-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Yêu cầu thuê phòng {selectedRoom?.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Vui lòng để lại thông tin liên lạc chính xác</p>
                   </div>

                   <div className="space-y-5">
                      <input 
                        required placeholder="Họ và tên của bạn"
                        value={rentalForm.fullName}
                        onChange={e => setRentalForm({...rentalForm, fullName: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required placeholder="Số điện thoại"
                          value={rentalForm.phone}
                          onChange={e => setRentalForm({...rentalForm, phone: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                        <input 
                          required type="email" placeholder="Địa chỉ Email"
                          value={rentalForm.email}
                          onChange={e => setRentalForm({...rentalForm, email: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <textarea 
                        rows={3} placeholder="Tin nhắn kèm theo (nếu có)"
                        value={rentalForm.message}
                        onChange={e => setRentalForm({...rentalForm, message: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                      />
                   </div>

                   <button 
                    disabled={sendingRequest}
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:bg-indigo-300"
                   >
                     {sendingRequest ? 'ĐANG GỬI...' : 'XÁC NHẬN GỬI YÊU CẦU'}
                   </button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  )
}

