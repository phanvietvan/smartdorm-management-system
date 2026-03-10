import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [tenant, setTenant] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    roomsApi.getById(id)
      .then(async (res) => {
        const r = res.data
        setRoom(r)
        // If room is occupied and we don't have tenant info, try to find the user
        if (r.status === 'occupied') {
          try {
            const usersRes = await usersApi.getAll()
            const found = usersRes.data.find(u => u.roomId === r._id || (u.roomId as any)?._id === r._id)
            if (found) setTenant(found)
          } catch (err) {
            console.error('Không thể tải thông tin người thuê', err)
          }
        }
      })
      .catch(() => setError('Không tìm thấy phòng'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  
  if (error) return (
    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
      {error}
      <Link to="/app/rooms" className="block text-sm mt-3 text-indigo-600 hover:text-indigo-800 underline">← Trở về danh sách phòng</Link>
    </div>
  )

  if (!room) return null

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <Link to="/app/rooms" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2 group">
            <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại danh sách phòng
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            {room.name}
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${room.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : room.status === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-200/50' : 'bg-indigo-50 text-indigo-600 border-indigo-200/50'}`}>
              {room.status === 'available' ? 'Trống' : room.status === 'maintenance' ? 'Đang Sửa chữa' : 'Đã thuê'}
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Thông tin chi tiết về phòng</p>
        </div>
        
        {/* Placeholder for future actions like Edit or Delete */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Giá Thuê Cơ Bản</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-800">{(room.price || 0).toLocaleString('vi-VN')}</span>
                  <span className="text-lg font-bold text-slate-500 pb-1">₫ /tháng</span>
                </div>
              </div>
            </div>
            {room.status === 'available' && (
              <div className="bg-emerald-50 rounded-xl px-5 py-4 border border-emerald-100/50 flex-shrink-0">
                <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sẵn sàng cho thuê
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-6">Thông số phòng</h2>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               
               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-4 transition-colors hover:bg-slate-50">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Khu Nhà / Tòa Building</p>
                   <p className="text-sm font-bold text-slate-800 mt-1">{typeof room.areaId === 'object' && room.areaId ? room.areaId.name : room.areaId || 'Chưa thiết lập'}</p>
                 </div>
               </div>

               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-4 transition-colors hover:bg-slate-50">
                 <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tầng (Floor)</p>
                   <p className="text-sm font-bold text-slate-800 mt-1">Tầng {room.floor}</p>
                 </div>
               </div>

               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-4 transition-colors hover:bg-slate-50">
                 <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sức chứa tối đa</p>
                   <p className="text-sm font-bold text-slate-800 mt-1">{room.capacity} người</p>
                 </div>
               </div>
               
               <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-4 transition-colors hover:bg-slate-50">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tiện ích đi kèm</p>
                   <p className="text-sm font-bold text-slate-800 mt-1">Cơ bản</p>
                 </div>
               </div>
             </div>
          </div>

          {room.equipments && room.equipments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Danh sách Trang thiết bị</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide rounded-tl-xl">Tên thiết bị</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Số lượng</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-center rounded-tr-xl">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {room.equipments.map((eq, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{eq.name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 text-center">{eq.quantity}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${eq.status === 'good' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : eq.status === 'damaged' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            {eq.status === 'good' ? 'Tốt' : eq.status === 'damaged' ? 'Hư hỏng' : 'Đang bảo trì'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-md text-white border border-slate-800 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
             <h3 className="text-lg font-bold text-slate-100 mb-4 relative z-10">Tình trạng thuê</h3>
             {room.status === 'occupied' ? (
               <div className="space-y-4 relative z-10">
                 <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Người đang ở</p>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                       {tenant?.fullName?.charAt(0).toUpperCase() || '?'}
                     </div>
                     <div>
                       <div className="text-sm font-bold text-white">{tenant?.fullName || 'Đang xác minh...'}</div>
                       <div className="text-[10px] text-slate-400 font-medium">{tenant?.email || '—'}</div>
                     </div>
                   </div>
                 </div>
                 <Link to="/app/users" className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-center transition-colors">
                   Quản lý người thuê
                 </Link>
               </div>
             ) : room.status === 'maintenance' ? (
                <div className="space-y-4 relative z-10">
                 <p className="text-sm text-slate-300">Phòng đang trong quá trình bảo trì kỹ thuật.</p>
                 <Link to="/app/maintenance" className="block w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 text-center transition-colors">
                   Lịch sử sửa chữa
                 </Link>
               </div>
             ) : (
               <div className="space-y-4 relative z-10">
                 <p className="text-sm text-slate-300">Phòng đang trống và sẵn sàng dẫn khách xem phòng.</p>
                 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 text-center italic leading-relaxed">
                   Gán người thuê trực tiếp từ trang Quản lý Người dùng
                 </div>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
