import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/payments'

export default function VnpayCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading')
  const [message, setMessage] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const verify = async () => {
      try {
        const res = await paymentsApi.checkVnpStatus(searchParams.toString())
        if (res.data.success) {
          setStatus('success')
        } else {
          setStatus('fail')
          setMessage(res.data.message || 'Thanh toán không thành công')
        }
      } catch (err: any) {
        setStatus('fail')
        setMessage(err?.response?.data?.message || 'Lỗi xác nhận thanh toán')
      }
    }
    
    verify()
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-1000">
      <div className="bg-white p-12 rounded-[3rem] shadow-[0px_40px_80px_rgba(74,63,226,0.08)] border border-slate-50 max-w-lg w-full relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

        {status === 'loading' ? (
          <div className="py-12 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#4b49cb] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Đang xác thực giao dịch...</p>
          </div>
        ) : status === 'success' ? (
          <div className="animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100/50">
               <span className="material-symbols-outlined text-6xl">check_circle</span>
             </div>
             <h1 className="text-4xl font-black text-[#2c2f31] mb-4 font-display tracking-tighter">Thanh toán<br/>thành công!</h1>
             <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
               Hệ thống đã ghi nhận khoản thanh toán. Hóa đơn của bạn đã được cập nhật trạng thái "Đã thanh toán".
             </p>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-rose-100/50">
               <span className="material-symbols-outlined text-6xl">cancel</span>
             </div>
             <h1 className="text-4xl font-black text-[#2c2f31] mb-4 font-display tracking-tighter">Thanh toán<br/>thất bại.</h1>
             <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
                {message || 'Giao dịch không thành công hoặc đã bị hủy bỏ. Vui lòng thử lại hoặc liên hệ quản lý nếu có thắc mắc.'}
             </p>
          </div>
        )}
        
        <button
          onClick={() => navigate('/app/payments')}
          className="w-full py-5 bg-[#4b49cb] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-indigo-200 hover:brightness-110 active:scale-95 transition-all relative z-10"
        >
          Quay lại Lịch sử thanh toán
        </button>
      </div>
    </div>
  )
}
