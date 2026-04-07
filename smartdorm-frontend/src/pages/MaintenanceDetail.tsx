import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { maintenanceApi, type MaintenanceRequest } from '../api/maintenance'
import { uploadApi } from '../api/upload'
import { useAuth } from '../context/AuthContext'

export default function MaintenanceDetail() {
  const { user } = useAuth()
  const { id } = useParams() as { id: string }
  const [req, setReq] = useState<MaintenanceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const isStaff = user && ['admin', 'manager', 'landlord', 'maintenance_staff'].includes(user.role)
  const isTenant = user?.role === 'tenant'

  const load = () => {
    maintenanceApi.getById(id).then((r) => setReq(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  const handleUpdateStatus = async (status: string) => {
    if (!req) return
    try {
      await maintenanceApi.update(req._id, { status })
      load()
    } catch (e: any) {
      alert('Lỗi cập nhật trạng thái')
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !req) return
    setUploading(true)
    try {
      const { data } = await uploadApi.uploadFile(file)
      const newImages = [...(req.images || []), data.fileUrl]
      await maintenanceApi.update(req._id, { images: newImages })
      load()
    } catch (err) {
      alert('Lỗi tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmDone = async () => {
    if (!req) return
    setSubmitting(true)
    try {
      await maintenanceApi.confirmDone(req._id, { rating, review })
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!req) return (
    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium text-center">
      Không tìm thấy yêu cầu sửa chữa
      <Link to="/app/maintenance" className="block text-sm mt-3 text-indigo-600 hover:text-indigo-800 underline">← Trở về danh sách</Link>
    </div>
  )

  const room = typeof req.roomId === 'object' ? req.roomId : null
  const tenant = typeof req.tenantId === 'object' ? req.tenantId : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link to="/app/maintenance" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2 group">
          <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Danh sách yêu cầu
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className={`h-2 w-full ${req.status === 'completed' ? 'bg-emerald-500' : req.status === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
        
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{req.title}</h1>
              <p className="text-slate-500 font-medium mt-1 text-sm flex items-center gap-2">
                Gửi lúc: {req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : '-'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isStaff ? (
                <select 
                  value={req.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border outline-none cursor-pointer
                    ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      req.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                      'bg-rose-50 text-rose-600 border-rose-200'}`}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="in_progress">Đang sửa</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              ) : (
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border 
                  ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    req.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-rose-50 text-rose-600 border-rose-200'}`}
                >
                  {req.status === 'pending' ? 'Chờ xử lý' : req.status === 'in_progress' ? 'Đang sửa' : 'Hoàn thành'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-100 font-medium">
            <div>
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Phòng / Khu vực</div>
              <h3 className="text-lg font-bold text-indigo-700">{room?.name || 'Vãng lai'}</h3>
            </div>
            <div>
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Người báo cáo</div>
              <h3 className="text-lg font-bold text-slate-800">{tenant?.fullName || 'Ẩn danh'}</h3>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-3">Mô tả lỗi</div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-700 leading-relaxed shadow-inner">
                {req.description || 'Không có mô tả.'}
              </div>
            </div>

            {/* Evidence Images */}
            <div>
              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center justify-between">
                Ảnh minh chứng / Kết quả
                {isStaff && (
                  <label className="text-indigo-600 cursor-pointer hover:underline text-xs normal-case">
                    {uploading ? 'Đang tải...' : '+ Thêm ảnh'}
                    <input type="file" className="hidden" onChange={handleUploadImage} disabled={uploading}/>
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {req.images?.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 transition-all shadow-sm">
                    <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                  </a>
                ))}
                {(!req.images || req.images.length === 0) && (
                  <div className="col-span-full py-8 text-center text-slate-400 text-sm italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có ảnh minh chứng nào được tải lên.
                  </div>
                )}
              </div>
            </div>

            {/* Rating Section */}
            {req.status === 'completed' && (
              <div className="pt-6 border-t border-slate-100">
                {req.rating ? (
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="text-emerald-700 font-bold text-xs uppercase tracking-widest mb-3">Đánh giá dịch vụ</div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-5 h-5 ${s <= req.rating! ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      ))}
                    </div>
                    {req.review && <p className="text-slate-700 italic text-sm">"{req.review}"</p>}
                  </div>
                ) : isTenant ? (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
                    <h3 className="text-lg font-bold text-indigo-900">Xác nhận hoàn thành & Đánh giá</h3>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setRating(s)} className={`w-8 h-8 ${s <= rating ? 'text-amber-400' : 'text-slate-300'}`}><svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Nhận xét của bạn..." 
                      className="w-full p-4 border border-indigo-200 rounded-xl text-sm"
                      value={review} onChange={e => setReview(e.target.value)}
                    />
                    <button 
                      onClick={handleConfirmDone} disabled={submitting}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center text-sm italic">Đang chờ người thuê xác nhận và đánh giá.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
