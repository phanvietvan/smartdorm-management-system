import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Phone, Lock, ArrowRight, Github, Info } from 'lucide-react'
import Lottie from 'lottie-react'
import homeAnimation from './Home.json'
import materialWaveLoading from '../assets/MaterialWaveLoading.json'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || ''
  const hasValidGoogleId = !!googleClientId && googleClientId.includes('.apps.googleusercontent.com')

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setError('')
    setLoading(true)
    try {
      const result = await googleLogin(credentialResponse.credential)

      if (result.state === 'approved') {
        navigate('/app/dashboard')
      } else if (result.state === 'pending') {
        navigate('/pending-approval', { state: { message: result.message } })
      } else if (result.state === 'blocked') {
        setError(result.message || 'Tài khoản của bạn đang chờ duyệt hoặc đã bị từ chối')
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký Google thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ email, password, fullName, phone: phone || undefined })
      navigate('/app/dashboard')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#191c1d] font-manrope selection:bg-indigo-100 flex flex-col relative overflow-hidden"
         style={{
           backgroundImage: `
             radial-gradient(at 0% 0%, hsla(253,16%,7%,0.03) 0, transparent 50%), 
             radial-gradient(at 50% 0%, hsla(350,100%,92%,0.6) 0, transparent 60%), 
             radial-gradient(at 100% 0%, hsla(225,39%,30%,0.03) 0, transparent 50%), 
             radial-gradient(at 0% 100%, hsla(190,100%,93%,0.5) 0, transparent 60%), 
             radial-gradient(at 50% 100%, hsla(45,100%,90%,0.5) 0, transparent 60%), 
             radial-gradient(at 100% 100%, hsla(30,100%,88%,0.5) 0, transparent 60%)
           `
         }}>
      
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[520px]">
          
          {/* Brand Anchor */}
          <div className="mb-0 text-center animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="flex justify-center mb-0">
               <div className="w-28 h-28 drop-shadow-2xl">
                  <Lottie animationData={homeAnimation} loop={true} />
               </div>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1e293b] mb-1 leading-none">
              SMARTDORM
            </h1>
            <p className="text-[#595c5e] text-[10px] tracking-[0.3em] font-black uppercase opacity-70">
              Modern Housing Management
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden animate-in zoom-in-95 duration-500">
            
            <div className="mb-8 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-black tracking-tighter text-[#1e293b] mb-2 leading-none">Tạo tài khoản mới</h2>
              <p className="text-[#595c5e] text-base font-medium">Tham gia cộng đồng quản lý thông minh.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50/50 backdrop-blur-md text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e] ml-1">Họ và tên</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#f2f4f5]/50 border-none rounded-xl px-4 py-4 text-[#1e293b] font-bold focus:ring-0 transition-all duration-300 placeholder:text-slate-300 backdrop-blur-sm"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#4b49cb] group-focus-within:w-full transition-all duration-500"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e] ml-1">Số điện thoại</label>
                  <div className="relative group">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912..."
                      className="w-full bg-[#f2f4f5]/50 border-none rounded-xl px-4 py-4 text-[#1e293b] font-bold focus:ring-0 transition-all duration-300 placeholder:text-slate-300 backdrop-blur-sm"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#4b49cb] group-focus-within:w-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e] ml-1">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#f2f4f5]/50 border-none rounded-xl px-4 py-4 text-[#1e293b] font-bold focus:ring-0 transition-all duration-300 placeholder:text-slate-300 backdrop-blur-sm"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#4b49cb] group-focus-within:w-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e] ml-1">Mật khẩu</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f2f4f5]/50 border-none rounded-xl px-4 py-4 text-[#1e293b] font-bold focus:ring-0 transition-all duration-300 placeholder:text-slate-300 backdrop-blur-sm"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#4b49cb] group-focus-within:w-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#4b49cb] text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all duration-300 group flex items-center justify-center space-x-2"
                >
                   {loading ? (
                    <div className="w-10 h-10">
                      <Lottie animationData={materialWaveLoading} loop />
                    </div>
                  ) : (
                    <>
                      <span>Đăng ký ngay</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-[#f2f4f5]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.1em]">
                <span className="bg-transparent px-4 text-[#595c5e]">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                {hasValidGoogleId ? (
                   <div className="w-full [&>div]:w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google failed")}
                        theme="outline"
                        shape="pill"
                        size="large"
                        width="100%"
                      />
                    </div>
                ) : (
                  <button className="w-full h-12 flex items-center justify-center gap-3 bg-white/50 border-2 border-[#f2f4f5] text-[#1e293b] font-bold rounded-2xl hover:bg-slate-50 transition-all duration-200 group  backdrop-blur-sm shadow-sm" type="button">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:text-[#4b49cb] transition-colors">Google Account</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-[#595c5e]">
                Đã có tài khoản? 
                <Link to="/login" className="text-[#4b49cb] font-black ml-1 hover:underline underline-offset-4 decoration-2">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/20 border-t border-white/30 flex flex-col md:flex-row justify-between items-center px-12 w-full py-12 relative z-10 transition-colors">
        <div className="flex flex-col mb-8 md:mb-0 text-center md:text-left">
          <span className="text-xs font-black text-[#1e293b] tracking-tighter uppercase">SMARTDORM</span>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#4c616c] mt-1">© 2024 SmartDorm system. All rights reserved.</p>
        </div>
        <div className="flex space-x-8">
          <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-[#595c5e] hover:text-[#4b49cb] transition-colors">Privacy</Link>
          <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-[#595c5e] hover:text-[#4b49cb] transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
