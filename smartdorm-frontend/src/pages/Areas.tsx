import { useEffect, useState } from 'react'
import { areasApi, type Area } from '../api/areas'
import { useAuth } from '../context/AuthContext'

export default function Areas() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)

  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Area | null>(null)
  const [form, setForm] = useState({ name: '', address: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => areasApi.getAll().then((r) => setAreas(r.data)).catch(() => setError('Không thể tải dữ liệu khu nhà'))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    if (editing) {
      areasApi.update(editing._id, form)
        .then(() => { 
          load(); 
          setEditing(null); 
          setShowForm(false); 
          setForm({ name: '', address: '', description: '' }) 
        })
        .catch((err) => setError(err.response?.data?.message || 'Lỗi cập nhật'))
        .finally(() => setSubmitting(false))
    } else {
      areasApi.create(form)
        .then(() => { 
          load(); 
          setShowForm(false); 
          setForm({ name: '', address: '', description: '' }) 
        })
        .catch((err) => setError(err.response?.data?.message || 'Lỗi thêm mới'))
        .finally(() => setSubmitting(false))
    }
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khu nhà này không? Toàn bộ phòng thuộc khu này có thể bị ảnh hưởng.')) return
    
    areasApi.delete(id)
      .then(() => load())
      .catch(() => setError('Không thể xóa khu nhà này do đã có phòng liên kết hoặc lỗi hệ thống.'))
  }

  if (loading && areas.length === 0) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Khu nhà</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Hệ thống hiện có <span className="text-indigo-600 font-bold">{areas.length}</span> khu nhà / tòa nhà.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(!showForm)
              if (showForm) setForm({ name: '', address: '', description: '' })
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Thêm khu nhà
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {/* Form Area */}
      {(showForm || editing) && isAdmin && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transform origin-top transition-all max-w-2xl">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">
            {editing ? 'Chỉnh sửa thông tin khu nhà' : 'Thêm khu nhà mới'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Tên khu nhà <span className="text-rose-500">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                placeholder="VD: Khu A, Tòa Landmark 81..."
              />
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Địa chỉ</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                placeholder="VD: 123 Đường Điện Biên Phủ, Quận Bình Thạnh"
              />
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Mô tả thêm</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 resize-none"
                placeholder="Ghi chú về cơ sở vật chất, ban quản lý..."
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              {editing && (
                <button 
                  type="button" 
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  onClick={() => { 
                    setEditing(null)
                    setShowForm(false)
                    setForm({ name: '', address: '', description: '' }) 
                    setError('')
                  }}
                >
                  Hủy
                </button>
              )}
              <button 
                type="submit" 
                className={`px-6 py-2.5 ${editing ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-70 flex-1 flex items-center justify-center gap-2`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang lưu...
                  </>
                ) : editing ? 'Cập nhật thay đổi' : 'Xác nhận tạo mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.length > 0 ? areas.map((a) => (
          <div key={a._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1" title={a.name}>{a.name}</h3>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 flex-grow pt-2 relative z-10">
              <div className="flex items-start text-sm">
                <svg className="w-4 h-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-slate-600 font-medium line-clamp-2">{a.address || <span className="text-slate-400 italic">Chưa cập nhật địa chỉ</span>}</span>
              </div>
              
              {a.description && (
                <div className="flex items-start text-sm">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-slate-500 line-clamp-2">{a.description}</span>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 relative z-10 mt-auto">
                <button 
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm transition-colors border border-slate-200"
                  onClick={() => { 
                    setEditing(a); 
                    setShowForm(false); 
                    setForm({ name: a.name, address: a.address || '', description: a.description || '' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Sửa
                </button>
                <button 
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-sm transition-colors border border-rose-100"
                  onClick={() => handleDelete(a._id)}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chưa có khu nhà nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Hệ thống của bạn chưa có khu nhà, tòa nhà hoặc chi nhánh nào. Vui lòng thêm mới để bắt đầu quản lý.</p>
            {isAdmin && (
               <button
                 onClick={() => setShowForm(true)}
                 className="mt-6 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
               >
                 Tạo khu nhà đầu tiên
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
