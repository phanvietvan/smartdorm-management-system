import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import successAlertAnimation from '../assets/SuccessAlert.json'

type SuccessScreenProps = {
  message: string
  /** Dòng phụ hiển thị dưới message */
  subMessage?: string
  /** Chuyển tới route sau khi hết delay */
  nextPath?: string
  /** Gọi sau khi hết delay (dùng khi không chuyển trang, chỉ đóng overlay) */
  onDone?: () => void
  delayMs?: number
}

export default function SuccessScreen({ message, subMessage, nextPath, onDone, delayMs = 2500 }: SuccessScreenProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => {
      if (onDone) onDone()
      else if (nextPath) navigate(nextPath, { replace: true })
    }, delayMs)
    return () => clearTimeout(t)
  }, [navigate, nextPath, onDone, delayMs])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/98 backdrop-blur-sm" role="alert" aria-live="polite">
      <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-6 text-center">
        <div className="w-32 h-32 flex-shrink-0">
          <Lottie
            animationData={successAlertAnimation}
            loop={false}
            className="w-full h-full"
          />
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-800">
          {message}
        </p>
        {subMessage && (
          <p className="mt-2 text-sm text-slate-500 max-w-xs">
            {subMessage}
          </p>
        )}
        <p className="mt-2 text-sm text-slate-500 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Đang chuyển trang...
        </p>
      </div>
    </div>
  )
}
