import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function VnpayCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode')
    if (responseCode === '00') {
      setStatus('success')
      setMessage('Thanh toán thành công! Hóa đơn của bạn đã được cập nhật.')
    } else {
      setStatus('fail')
      setMessage('Thanh toán thất bại hoặc đã bị bạn hủy bỏ.')
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        {status === 'loading' ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        ) : status === 'success' ? (
          <>
            <CheckCircleIcon className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thành công</h1>
            <p className="text-slate-600 mb-6">{message}</p>
          </>
        ) : (
          <>
            <XCircleIcon className="h-20 w-20 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-slate-600 mb-6">{message}</p>
          </>
        )}
        
        <button
          onClick={() => navigate('/app/payments')}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          Quay lại Lịch sử thanh toán
        </button>
      </div>
    </div>
  )
}
