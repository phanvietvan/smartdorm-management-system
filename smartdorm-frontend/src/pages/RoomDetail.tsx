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
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="room-detail max-w-md mx-auto p-8 rd-card text-center">
      <p className="rd-value">{error}</p>
      <Link to="/app/rooms" className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-semibold text-sm hover:text-indigo-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Quay lại danh sách phòng
      </Link>
    </div>
  )

  if (!room) return null

  const areaName = typeof room.areaId === 'object' && room.areaId ? room.areaId.name : (room.areaId || 'Chưa cập nhật')

  return (
    <div className="room-detail max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header: cân đối 1 hàng */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 mb-8">
        <div className="min-w-0">
          <Link
            to="/app/rooms"
            className="inline-flex items-center gap-2 rd-label text-slate-500 hover:text-indigo-600 transition-colors mb-3"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại danh sách
          </Link>
          <h1 className="rd-title">Phòng {room.name}</h1>
          <p className="rd-label mt-1 font-medium normal-case">Hồ sơ chi tiết</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Chỉnh sửa
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: nội dung chính */}
        <div className="lg:col-span-8 space-y-6">
          {/* Giá + trạng thái: 1 card cân đối */}
          <section className="rd-card">
            <p className="rd-label mb-2">Giá thuê cơ bản</p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="rd-price">{(room.price || 0).toLocaleString('vi-VN')}</span>
              <span className="rd-value text-slate-500 font-medium">VNĐ / tháng</span>
            </div>
            <div className="mt-5">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  room.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : room.status === 'maintenance'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${room.status === 'available' ? 'bg-emerald-500' : room.status === 'maintenance' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                {room.status === 'available' ? 'Phòng trống' : room.status === 'maintenance' ? 'Bảo trì' : 'Đã cho thuê'}
              </span>
            </div>
          </section>

          {/* Thông số: 2x2 lưới đều */}
          <section className="rd-card">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-5 bg-indigo-500 rounded-full" />
              <h2 className="rd-section-title">Thông số chi tiết</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Khu vực', value: areaName },
                { label: 'Tầng', value: `Tầng ${room.floor}` },
                { label: 'Sức chứa', value: `${room.capacity} người` },
                { label: 'Tiện nghi', value: 'Tiêu chuẩn' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/80 border border-slate-100/80">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="rd-label">{item.label}</span>
                    <span className="rd-value mt-0.5">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Thiết bị */}
          {room.equipments && room.equipments.length > 0 && (
            <section className="rd-card">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                <h2 className="rd-section-title">Trang thiết bị</h2>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pr-4 rd-label text-left">Thiết bị</th>
                      <th className="pb-3 px-4 rd-label text-center w-16">SL</th>
                      <th className="pb-3 pl-4 rd-label text-right">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {room.equipments.map((eq, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-4 rd-value">{eq.name}</td>
                        <td className="py-3 px-4 rd-value text-center text-slate-600">{eq.quantity}</td>
                        <td className="py-3 pl-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${eq.status === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {eq.status === 'good' ? 'Ổn định' : 'Cần kiểm tra'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Cột phải: người thuê hoặc trống */}
        <div className="lg:col-span-4">
          {tenant ? (
            <aside className="rd-card lg:sticky lg:top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden mb-3">
                  <img
                    src={tenant.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.fullName)}&background=4f46e5&color=fff&bold=true&size=160`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="rd-value text-base">{tenant.fullName}</h3>
                <span className="inline-flex mt-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Người thuê phòng
                </span>
              </div>
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="rd-label">Số điện thoại</p>
                  <p className="rd-value mt-0.5">{tenant.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="rd-label">Email</p>
                  <p className="rd-value mt-0.5 break-all">{tenant.email || '—'}</p>
                </div>
              </div>
              <Link
                to="/app/users"
                className="mt-6 w-full py-2.5 bg-indigo-600 text-white text-center font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-colors block"
              >
                Xem hồ sơ
              </Link>
            </aside>
          ) : (
            <aside className="rd-card border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center text-center min-h-[240px]">
              <div className="w-14 h-14 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h3 className="rd-value text-slate-600">Phòng trống</h3>
              <p className="rd-label mt-1 font-medium normal-case text-slate-400">Sẵn sàng cho thuê mới</p>
              <button type="button" className="mt-5 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                Thêm người thuê
              </button>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
