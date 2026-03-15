import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { areasApi, type Area } from '../api/areas'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import Lottie from 'lottie-react'
import homeIconAnimation from '../assets/Home Icon.json'
import smilingMascotAnimation from '../assets/SmilingMascot.json'
import SuccessScreen from '../components/SuccessScreen'

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

  const [rooms, setRooms] = useState<Room[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [tenants, setTenants] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', floor: 1, capacity: 1, price: 0, status: 'available', areaId: '', amenities: [] as string[], tenantId: '' })
  const [newAmenity, setNewAmenity] = useState('')
  const [equipments, setEquipments] = useState<EquipmentInput[]>([])
  const [formError, setFormError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchTerm(query)
  }, [searchParams])

  const handleLocalSearch = (val: string) => {
    setSearchTerm(val)
    if (val) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({})
    }
  }

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        if (isTenant) {
          // Fetch room based on tenant's token (most reliable)
          try {
            const roomRes = await roomsApi.getMyRoom()
            console.log('My room fetch result:', roomRes.data)
            setRooms([roomRes.data])
          } catch (fetchErr) {
            console.error('Failed to fetch my room:', fetchErr)
            setRooms([])
          }
          setAreas([])
          setTenants([])
        } else if (isGuest) {
          // If guest, fetch available rooms
          const [roomsRes, areasRes] = await Promise.all([
            roomsApi.getAvailable(),
            areasApi.getAll()
          ])
          setRooms(roomsRes.data)
          setAreas(areasRes.data)
          setTenants([])
        } else {
          // Admin/Manager/Landlord
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
      amenities: [],
      tenantId: '',
    }))
    setEquipments([])
    setFormError('')
    setNewAmenity('')
  }

  const addAmenity = () => {
    if (!newAmenity.trim()) return
    if (form.amenities.includes(newAmenity.trim())) return
    setForm(prev => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }))
    setNewAmenity('')
  }

  const removeAmenity = (tag: string) => {
    setForm(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== tag) }))
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
              {/* Amenities Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiện ích trải nghiệm</label>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">{form.amenities.length} đã chọn</span>
                </div>
                <div className="flex gap-2 p-2 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                  <input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    placeholder="VD: Wifi 5G, Ban công, Tủ lạnh..."
                    className="flex-1 bg-transparent px-4 py-2 font-bold text-slate-700 outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={addAmenity}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                  {form.amenities.map(a => (
                    <span key={a} className="group inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl text-xs font-black border border-slate-100 shadow-sm hover:border-rose-200 hover:text-rose-600 transition-all cursor-default">
                      {a}
                      <button type="button" onClick={() => removeAmenity(a)} className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 flex items-center justify-center transition-colors">×</button>
                    </span>
                  ))}
                </div>
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

        {/* Room Grid or Table */}
        {isTenant ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(r => (
                <div key={r._id} className="group relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100/80 overflow-hidden transition-all duration-400 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100">
                  {/* Subtle gradient accent at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-90" />
                  <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-8">
                    {/* Left: Icon */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-50 to-violet-50/80 border border-indigo-100/60 shadow-inner overflow-hidden">
                      <Lottie animationData={smilingMascotAnimation} loop={true} className="w-full h-full object-contain" />
                    </div>

                    {/* Center: Details */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight room-luxury-title">
                          Phòng {r.name}
                        </h3>
                        <span className="px-4 py-1.5 bg-emerald-50/90 text-emerald-700 text-[11px] font-semibold uppercase tracking-[0.2em] rounded-full border border-emerald-200/60 shadow-sm">
                          Đang ở
                        </span>
                      </div>
                      <div className="flex items-center gap-8 text-slate-500">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 text-indigo-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </span>
                          <span className="text-sm font-medium tracking-wide">{r.capacity} Người</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 text-indigo-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </span>
                          <span className="text-sm font-medium tracking-wide">Tầng {r.floor}</span>
                        </div>
                      </div>
                      <p className="pt-1">
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                          {r.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-400 font-medium ml-2 tracking-wide">VNĐ / Tháng</span>
                      </p>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex items-center sm:pl-4">
                      <Link
                        to={`/app/rooms/${r._id}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 sm:py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200/80 flex flex-col items-center text-center space-y-8 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center text-slate-300 border border-slate-100">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight room-luxury-title">Chưa có phòng ở</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed text-sm tracking-wide">Hành trình của bạn bắt đầu khi một không gian sống được bàn giao.</p>
                </div>
              </div>
            )}
          </div>
        ) : isGuest ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRooms.map((r, idx) => (
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

                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-widest">
                    <span className="text-slate-400">Tầng số</span>
                    <span className="text-slate-900">{r.floor}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-widest">
                    <span className="text-slate-400">Sức chứa</span>
                    <span className="text-slate-900">{r.capacity} Người ở</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Giá tháng</p>
                    <p className="text-2xl font-extrabold text-indigo-600 tracking-tightest">{r.price?.toLocaleString()} ₫</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-extrabold text-slate-400 italic max-w-[140px] text-right uppercase tracking-wider leading-relaxed">
                    Liên hệ quản lý để chốt
                  </div>
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
    </div>
  )
}
