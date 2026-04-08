import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Lottie from "lottie-react";
import homeAnimation from "./Home.json";
import materialWaveLoading from "../assets/MaterialWaveLoading.json";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";
  const hasValidGoogleId = !!googleClientId && googleClientId.includes(".apps.googleusercontent.com");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      setError(response?.message || response?.error || (err as Error).message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/app/dashboard");
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      setError(response?.message || response?.error || (err as Error).message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full max-w-[480px]">
          
          {/* Brand Anchor */}
          <Link to="/" className="mb-0 text-center animate-in fade-in slide-in-from-top-8 duration-700 block transition-transform active:scale-95 group">
            <div className="flex justify-center mb-0">
               <div className="w-28 h-28 drop-shadow-2xl">
                  <Lottie animationData={homeAnimation} loop={true} />
               </div>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1e293b] mb-1 leading-none group-hover:text-indigo-600 transition-colors uppercase">
              SMARTDORM
            </h1>
            <p className="text-[#595c5e] text-[10px] tracking-[0.3em] font-black uppercase opacity-70">
              Modern Housing Management
            </p>
          </Link>

          {/* Login Card */}
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden animate-in zoom-in-95 duration-500">
            
            <div className="mb-8 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-black tracking-tighter text-[#1e293b] mb-2 leading-none">Chào mừng bạn!</h2>
              <p className="text-[#595c5e] text-base font-medium">Nhập thông tin đăng nhập của bạn để tiếp tục.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50/50 backdrop-blur-md text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e] ml-1">Email của bạn</label>
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
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#4b49cb] transition-colors" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#595c5e]">Mật khẩu</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#4b49cb] hover:underline transition-all">Quên mật khẩu?</Link>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f2f4f5]/50 border-none rounded-xl px-4 py-4 text-[#1e293b] font-bold focus:ring-0 transition-all duration-300 placeholder:text-slate-300 backdrop-blur-sm"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#4b49cb] group-focus-within:w-full transition-all duration-500"></div>
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#4b49cb] transition-colors" />
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#4b49cb] text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all duration-300 group flex items-center justify-center space-x-2 relative overflow-hidden"
                >
                   {loading ? (
                    <div className="w-10 h-10">
                      <Lottie animationData={materialWaveLoading} loop />
                    </div>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-[#f2f4f5]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.1em]">
                <span className="bg-transparent px-4 text-[#595c5e]">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Sign In */}
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
                  <button className="w-full h-14 flex items-center justify-center gap-3 bg-white/50 border-2 border-[#f2f4f5] text-[#1e293b] font-bold rounded-2xl hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm shadow-sm" type="button">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:text-[#4b49cb] transition-colors">Google Account</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm font-bold text-[#595c5e]">
                Bạn mới đến đây? 
                <Link to="/register" className="text-[#4b49cb] font-black ml-1 hover:underline underline-offset-4 decoration-2">
                  Tạo tài khoản ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/20 border-t border-white/30 flex flex-col md:flex-row justify-between items-center px-12 w-full py-12 relative z-10 transition-colors">
        <div className="flex flex-col mb-8 md:mb-0 text-center md:text-left">
          <span className="text-sm font-black text-[#1e293b] tracking-tighter uppercase">SMARTDORM SYSTEM</span>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#595c5e] mt-2">© 2024 SmartDorm. All rights reserved.</p>
        </div>
        <div className="flex space-x-8">
          <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-[#595c5e] hover:text-[#4b49cb] transition-colors">Privacy</Link>
          <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-[#595c5e] hover:text-[#4b49cb] transition-colors">Terms</Link>
          <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-[#595c5e] hover:text-[#4b49cb] transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
}
