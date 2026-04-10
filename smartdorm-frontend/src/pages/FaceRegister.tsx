import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'
import { api } from '../api/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ScanFace, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  User, 
  Hash,
  ShieldCheck,
  Users,
  Clock
} from 'lucide-react'

// ========================================
// TRANG ĐĂNG KÝ KHUÔN MẶT CƯ DÂN
// Tích hợp vào SmartDorm Dashboard
// ========================================

export default function FaceRegister() {
  // --- State ---
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([])
  
  const webcamRef = useRef<Webcam>(null)

  // --- Load face-api.js models khi component mount ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Models cần nằm trong thư mục public/models_v2
        const MODEL_URL = '/models_v2'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        setModelsLoaded(true)
        console.log('✅ Face-api models loaded successfully')
      } catch (error) {
        console.error('❌ Error loading face-api models:', error)
        setMessage({ type: 'error', text: 'Không thể tải AI models. Hãy kiểm tra thư mục public/models/' })
      }
    }
    loadModels()
    fetchRegistered()
  }, [])

  // --- Lấy danh sách cư dân đã đăng ký ---
  const fetchRegistered = async () => {
    try {
      const res = await api.get('/face/students')
      if (res.data.success) {
        setRegisteredStudents(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching registered students:', err)
    }
  }

  // --- Chụp ảnh và trích xuất face descriptor ---
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Chụp ảnh từ webcam
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) {
        setMessage({ type: 'error', text: 'Không thể chụp ảnh. Hãy kiểm tra camera.' })
        setIsLoading(false)
        return
      }
      setCapturedImage(imageSrc)

      // Tạo element img để face-api xử lý
      const img = new Image()
      img.src = imageSrc
      await new Promise((resolve) => { img.onload = resolve })

      // Phát hiện khuôn mặt và trích xuất descriptor
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setFaceDetected(false)
        setMessage({ type: 'error', text: 'Không phát hiện khuôn mặt. Hãy nhìn thẳng vào camera.' })
        setIsLoading(false)
        return
      }

      setFaceDetected(true)

      // Gửi API đăng ký
      const faceDescriptor = Array.from(detection.descriptor)
      
      const response = await api.post('/face/register', {
        name,
        studentId,
        faceDescriptor,
      })

      if (response.data.success) {
        setMessage({ type: 'success', text: `✅ ${response.data.message}` })
        setName('')
        setStudentId('')
        setCapturedImage(null)
        fetchRegistered() // Refresh danh sách
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Lỗi khi đăng ký khuôn mặt'
      setMessage({ type: 'error', text: errMsg })
    } finally {
      setIsLoading(false)
    }
  }, [name, studentId, modelsLoaded])

  // --- Kiểm tra form hợp lệ ---
  const isFormValid = name.trim() !== '' && studentId.trim() !== '' && modelsLoaded && !isLoading

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
          <ScanFace size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Security</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đăng ký nhận diện khuôn mặt cho cư dân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === PHẦN 1: FORM ĐĂNG KÝ === */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Đăng ký khuôn mặt mới
            </h2>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  <User size={14} className="inline mr-1" /> Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  <Hash size={14} className="inline mr-1" /> Mã cư dân
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="SD-001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Camera & Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6">
              {!modelsLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-bold">Đang tải AI Models...</p>
                </div>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                />
              )}
              
              {/* Scan Frame Overlay */}
              {modelsLoaded && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-full animate-pulse" />
                </div>
              )}

              {/* Face Status */}
              <AnimatePresence>
                {faceDetected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Khuôn mặt đã phát hiện
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {capturedImage ? (
                <button
                  onClick={() => { setCapturedImage(null); setFaceDetected(false); setMessage({ type: '', text: '' }) }}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Chụp lại
                </button>
              ) : (
                <button
                  onClick={handleCapture}
                  disabled={!isFormValid}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> Đang xử lý...</>
                  ) : (
                    <><Camera size={18} /> Chụp & Đăng ký</>
                  )}
                </button>
              )}
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20'
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* === PHẦN 2: DANH SÁCH ĐÃ ĐĂNG KÝ === */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Đã đăng ký ({registeredStudents.length})
            </h3>

            {registeredStudents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">Chưa có cư dân nào đăng ký</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {registeredStudents.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                      {s.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{s.studentId}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">
                        {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hướng dẫn */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-500/20">
            <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 mb-3">Hướng dẫn</h3>
            <ol className="text-xs text-indigo-500 dark:text-indigo-300 space-y-2 font-medium list-decimal list-inside">
              <li>Nhập tên và mã cư dân</li>
              <li>Nhìn thẳng vào camera</li>
              <li>Nhấn "Chụp & Đăng ký"</li>
              <li>Chờ AI xử lý (2-3 giây)</li>
              <li>Hoàn tất! Cư dân có thể sử dụng khuôn mặt để mở cửa</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
