import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { roomsApi, type Room } from '../api/rooms'

export default function RoomsAvailable() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    roomsApi.getAvailable()
      .then((r) => setRooms(r.data))
      .catch(() => setError('Không thể tải danh sách phòng'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Transparent Header for public view */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic">Smart<span className="text-indigo-600">Dorm</span></h1>
        <Link to="/login" className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100">Đăng nhập</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Phòng Còn Trống</h2>
          <p className="text-lg text-slate-500 font-medium">Tìm kiếm không gian sống lý tưởng của riêng bạn.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-medium">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.length > 0 ? (
              rooms.map((r) => (
                <div key={r._id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">{r.name}</h3>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Còn trống</span>
                  </div>
                  
                  <div className="space-y-3 mb-8 text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      Khu {typeof r.areaId === 'object' ? (r.areaId as any)?.name : '—'}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                      Tầng {r.floor} • Tối đa {r.capacity} người
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <span className="text-3xl font-black text-indigo-600 tracking-tight">{(r.price || 0).toLocaleString()} <span className="text-sm font-medium text-slate-400">₫ / tháng</span></span>
                    </div>
                  </div>

                  <Link to="/login" className="block w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white text-center font-bold rounded-2xl transition-all shadow-lg shadow-slate-100">Đăng ký ngay</Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-bold text-slate-800">Hiện đang hết phòng trống</p>
                <p className="text-slate-400 mt-2">Vui lòng quay lại sau hoặc liên hệ hotline để được hỗ trợ.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
