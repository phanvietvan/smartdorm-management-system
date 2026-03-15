import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Lottie from "lottie-react";
import animationData from "./Home.json";
import materialWaveLoading from "../assets/MaterialWaveLoading.json";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen flex font-poppins bg-[#fafafa] selection:bg-blue-100 overflow-hidden">
      {/* Left Panel: Clean Form Section */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12 relative z-10 bg-white shadow-[20px_0_50px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-left-8 duration-1000">

          {/* Header Section */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[#1e293b] text-4xl lg:text-[42px] font-bold leading-[1.1] mb-1">
              Hey,
            </h2>
            <h2 className="text-[#1e293b] text-4xl lg:text-[42px] font-bold leading-[1.1] mb-5">
              Welcome to
            </h2>
            <h1 className="text-black text-5xl lg:text-6xl font-black tracking-tight mb-6">
              SmartDorm!
            </h1>
            <p className="text-[#64748b] text-[17px] font-medium opacity-80">
              We are very happy to see you back!
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[#1e293b] font-bold text-[13px] ml-1 opacity-90">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="smartdorm@gmail.com"
                className="w-full h-[48px] bg-slate-50/50 border border-slate-200 rounded-lg px-4 text-[#334155] font-medium placeholder-[#94a3b8] outline-none transition-all focus:bg-white focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 shadow-sm"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[#1e293b] font-bold text-[13px] ml-1 opacity-90">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[48px] bg-slate-50/50 border border-slate-200 rounded-lg px-4 text-[#334155] font-medium placeholder-[#94a3b8] outline-none transition-all focus:bg-white focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 shadow-sm"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white font-bold text-base rounded-lg transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(59,130,246,0.25)] disabled:opacity-50 mt-2 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <Lottie animationData={materialWaveLoading} loop className="w-full h-full" />
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] px-2">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Google Login Section */}
          <div className="space-y-5">
            <div className="w-full group">
              {hasValidGoogleId ? (
                <div className="flex justify-center [&>div]:w-full active:scale-[0.98] transition-transform">
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
                <button className="w-full h-[48px] bg-white border border-slate-200 rounded-full flex items-center justify-center gap-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-sm text-sm">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  Login with Google
                </button>
              )}
            </div>

            <p className="text-center text-[#64748b] font-medium text-[15px]">
              Don't have account?{" "}
              <Link to="/register" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
                Sign Up here!
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Animated Illustration Section */}
      <div className="hidden lg:flex flex-1 relative bg-white overflow-hidden items-center justify-center">
        {/* Abstract Mesh Background */}
        <div className="absolute inset-0 bg-[#f8fbff]" />
        <div className="absolute -top-[10%] -right-[15%] w-[900px] h-[900px] bg-[#ff3b3b] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.2] animate-blob" />
        <div className="absolute top-[20%] -right-[25%] w-[800px] h-[800px] bg-[#9333ea] rounded-full mix-blend-multiply filter blur-[130px] opacity-[0.2] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[1000px] h-[1000px] bg-[#3b82f6] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.25] animate-blob animation-delay-4000" />

        {/* Lottie Animation: Animated House */}
        <div className="relative z-10 w-full max-w-[650px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* Subtle branding accent */}
        <div className="absolute bottom-12 right-12 z-20 flex items-center gap-3 backdrop-blur-md bg-white/30 px-6 py-3 rounded-full border border-white/40 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[#1a1a1a] font-black tracking-tighter text-sm">SMARTDORM ECOSYSTEM</span>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
