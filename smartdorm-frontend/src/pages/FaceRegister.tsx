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
  Clock,
  Mail,
  Phone
} from 'lucide-react'

export default function FaceRegister() {
  const userLocal = JSON.parse(localStorage.getItem('user') || '{}')
  
  // --- State ---
  const [name, setName] = useState(userLocal?.fullName || 'Đang tải...')
  const [studentId, setStudentId] = useState(userLocal?.studentId || '...')
  const [email, setEmail] = useState(userLocal?.email || '...')
  const [phone, setPhone] = useState(userLocal?.phone || '...')
  const [roomInfo, setRoomInfo] = useState({ room: '...', block: '...' })
  
  const [isLoading, setIsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([])
  
  const webcamRef = useRef<Webcam>(null)

  // --- Lấy dữ liệu thật từ DB ---
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res.data.success) {
        const u = res.data.user
        setName(u.fullName || u.name)
        setStudentId(u.studentId || u.username)
        setEmail(u.email || 'N/A')
        setPhone(u.phone || u.phoneNumber || 'N/A')
        const roomObj = u.room || u.roomId
        const roomName = roomObj?.roomNumber || roomObj?.name || 'P238'
        const blockName = roomObj?.block || roomObj?.building || 'Cơ sở 1'
        setRoomInfo({ room: roomName, block: blockName })
      }
    } catch (err) {
      console.error('Error fetching real profile:', err)
    }
  }

  useEffect(() => {
    fetchProfile()
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models_v2'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        setModelsLoaded(true)
      } catch (error) {
        setMessage({ type: 'error', text: 'Không thể tải AI models.' })
      }
    }
    loadModels()
    fetchRegistered()
  }, [])

  const fetchRegistered = async () => {
    try {
      const res = await api.get('/face/students')
      if (res.data.success) setRegisteredStudents(res.data.data)
    } catch (err) { console.error(err) }
  }

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return setIsLoading(false)
      setCapturedImage(imageSrc)

      const img = new Image()
      img.src = imageSrc
      await new Promise((resolve) => { img.onload = resolve })

      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()

      if (!detection) {
        setFaceDetected(false)
        setMessage({ type: 'error', text: 'Không phát hiện khuôn mặt.' })
        return setIsLoading(false)
      }

      setFaceDetected(true)
      const response = await api.post('/face/register', {
        name,
        studentId,
        email,
        room: roomInfo.room,
        block: roomInfo.block,
        phoneNumber: phone,
        faceDescriptor: Array.from(detection.descriptor),
        role: userLocal?.role 
      })

      if (response.data.success) {
        setMessage({ type: 'success', text: `✅ ${response.data.message}` })
        fetchRegistered()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi đăng ký' })
    } finally {
      setIsLoading(false)
    }
  }, [name, studentId, email, phone, roomInfo, modelsLoaded, userLocal])

  const isFormValid = name !== '' && studentId !== '' && modelsLoaded && !isLoading

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Đăng ký khuôn mặt mới
            </h2>

            {/* Info Grid - 5 Items */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={10}/> Họ tên</p>
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{name}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Hash size={10}/> Mã số</p>
                <p className="text-xs font-black text-primary uppercase">{studentId}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Camera size={10}/> Phòng</p>
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{roomInfo.room} - {roomInfo.block}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={10}/> SĐT</p>
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{phone}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail size={10}/> Email</p>
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{email}</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6 ring-4 ring-slate-50 dark:ring-slate-800">
              {!modelsLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-bold">Đang tải AI Models...</p>
                </div>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} videoConstraints={{ width: 1280, height: 720, facingMode: "user" }} />
              )}
              {faceDetected && (
                <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2">
                  <CheckCircle2 size={14} /> Khuôn mặt đã phát hiện
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {capturedImage ? (
                <button onClick={() => { setCapturedImage(null); setFaceDetected(false); setMessage({ type: '', text: '' }) }} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 font-black text-sm text-slate-600 dark:text-slate-400 dark:border-slate-700">Chụp lại</button>
              ) : (
                <button onClick={handleCapture} disabled={!isFormValid} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm shadow-xl disabled:opacity-50 hover:shadow-indigo-500/20 transition-all">
                  {isLoading ? <><Loader2 className="animate-spin inline mr-2" size={18} /> Đang xử lý...</> : <><Camera className="inline mr-2" size={18} /> Chụp & Đăng ký</>}
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {message.text}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Đã đăng ký ({registeredStudents.length})
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {registeredStudents.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-10">Chưa có cư dân nào đăng ký</p>
              ) : (
                registeredStudents.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs">{s.name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{s.studentId}</p>
                      {s.email && <p className="text-[9px] text-slate-400 font-medium truncate">{s.email}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">{new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
