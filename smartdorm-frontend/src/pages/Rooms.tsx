import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { areasApi, type Area } from '../api/areas'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'

type EquipmentInput = {
  name: string
  status: string
  quantity: number
}

const ROOM_CREATOR_ROLES = ['admin', 'manager', 'landlord']

export default function Rooms() {
  const { user } = useAuth()
  const isGuest = user?.role === 'guest'
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

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const [roomsRes, areasRes, usersRes] = await Promise.all([
          isGuest ? roomsApi.getAvailable() : roomsApi.getAll(),
          areasApi.getAll(),
          !isGuest ? usersApi.getAll() : Promise.resolve({ data: [] })
        ])
        setRooms(roomsRes.data)
        setAreas(areasRes.data)
        setTenants(usersRes.data)

        if (!form.areaId && areasRes.data.length) {
          setForm((prev) => ({ ...prev, areaId: areasRes.data[0]._id }))
        }
      } catch (err) {
        setError('Không thể tải danh sách phòng hoặc khu nhà')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isGuest])

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
        // Update the newRoom status locally since it's now occupied
        newRoom.status = 'occupied'
      }

      setRooms((prev) => [newRoom, ...prev])
      resetForm()
      setShowForm(false)
      
      // Refresh user list to reflect new tenant assignment if needed
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

  if (loading) return (
    <div className="flex items-center justify-center p-12 text-slate-500 font-medium">Đang tải dữ liệu...</div>
  )
  if (error) return <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">{error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isGuest ? 'Phòng trống' : 'Quản lý phòng'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isGuest ? 'Danh sách các phòng bạn có thể thuê' : `Tổng số phòng: ${rooms.length}`}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {showForm ? 'Đóng' : 'Thêm phòng mới'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">Cấu hình phòng mới</h2>
          {formError && <div className="p-3 mb-5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{formError}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Khu nhà</label>
              <select
                value={form.areaId}
                onChange={(e) => setForm((prev) => ({ ...prev, areaId: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Chọn khu nhà</option>
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>{area.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tên phòng</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            
            <div className="space-y-1.5 border-t border-slate-50 pt-3 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Tầng</label>
                  <input type="number" value={form.floor} min={1} onChange={(e) => setForm((prev) => ({ ...prev, floor: Number(e.target.value) }))} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Sức chứa</label>
                  <input type="number" value={form.capacity} min={1} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Giá thuê (VNĐ)</label>
                  <input type="number" value={form.price} min={0} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Người thuê (Tùy chọn)</label>
                  <select
                    value={form.tenantId}
                    onChange={(e) => setForm(prev => ({ ...prev, tenantId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
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
            </div>

            {/* Amenities Section */}
            <div className="md:col-span-2 space-y-3 pt-6 border-t border-slate-100">
              <label className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Tiện ích (Amenities)</label>
              <div className="flex gap-2">
                <input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  placeholder="VD: Wifi, Điều hòa, Ban công..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
                <button 
                  type="button" 
                  onClick={addAmenity}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {form.amenities.map(a => (
                  <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                    {a}
                    <button type="button" onClick={() => removeAmenity(a)} className="text-indigo-400 hover:text-rose-500 font-black">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Equipments Section */}
            <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Trang thiết bị (Equipments)</label>
                <button
                  type="button"
                  onClick={() => setEquipments(prev => [...prev, { name: '', status: 'good', quantity: 1 }])}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                >
                  + Thêm thiết bị
                </button>
              </div>
              
              <div className="space-y-3">
                {equipments.map((eq, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <input
                      placeholder="Tên thiết bị (VD: Máy lạnh Daikin)"
                      value={eq.name}
                      onChange={(e) => {
                        const newEqs = [...equipments]
                        newEqs[idx].name = e.target.value
                        setEquipments(newEqs)
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="number" min={1} value={eq.quantity}
                        onChange={(e) => {
                          const newEqs = [...equipments]
                          newEqs[idx].quantity = Number(e.target.value) || 1
                          setEquipments(newEqs)
                        }}
                        className="w-16 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                      />
                      <select
                        value={eq.status}
                        onChange={(e) => {
                          const newEqs = [...equipments]
                          newEqs[idx].status = e.target.value
                          setEquipments(newEqs)
                        }}
                        className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600"
                      >
                        <option value="good">Tốt</option>
                        <option value="damaged">Hỏng</option>
                        <option value="maintenance">Bảo trì</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setEquipments(prev => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50" 
                disabled={creating}
              >
                {creating ? 'Đang tạo...' : 'Lưu phòng'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Grid or Table for Guests */}
      {isGuest ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(r => (
            <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{r.name}</h3>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100/50">Còn trống</span>
              </div>
              <div className="space-y-2 text-sm text-slate-500 font-medium mb-6">
                <div>Khu: {typeof r.areaId === 'object' ? (r.areaId as any)?.name : '—'}</div>
                <div>Tầng: {r.floor} • Sức chứa: {r.capacity} người</div>
                <div className="text-lg font-black text-indigo-600 pt-2 border-t border-slate-50 mt-2">
                  {r.price?.toLocaleString()} ₫ <span className="text-xs font-normal text-slate-400">/tháng</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic text-center">
                Liên hệ Admin để được gán vào phòng này
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed text-center text-slate-400">Hiện không có phòng nào trống.</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người thuê</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">{r.price?.toLocaleString()}₫</td>
                    <td className="px-6 py-4">
                      {r.status === 'occupied' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                            {tenants.find(t => t.roomId === r._id || (t.roomId as any)?._id === r._id)?.fullName.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {tenants.find(t => t.roomId === r._id || (t.roomId as any)?._id === r._id)?.fullName || '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        r.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {r.status === 'available' ? 'Trống' : 'Đã thuê'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/app/rooms/${r._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Chi tiết</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
