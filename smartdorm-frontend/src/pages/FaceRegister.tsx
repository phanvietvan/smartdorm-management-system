import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'
import { api } from '../api/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ScanFace, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  User, 
  Hash,
  ShieldCheck,
  Users,
  Mail,
  Zap,
  RotateCcw
} from 'lucide-react'

export default function FaceRegister() {
  const userLocal = JSON.parse(localStorage.getItem('user') || '{}')
  
  // --- Profile State ---
  const [name, setName] = useState(userLocal?.fullName || 'Đang tải...')
  const [studentId, setStudentId] = useState(userLocal?.studentId || '...')
  const [email, setEmail] = useState(userLocal?.email || '...')
  const [phone, setPhone] = useState(userLocal?.phone || '...')
  const [roomInfo, setRoomInfo] = useState({ room: '...', block: '...' })
  
  // --- State ---
  const [isLoading, setIsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | ''; text: string }>({ type: '', text: '' })
  const [faceDetected, setFaceDetected] = useState(false)
  const [earValue, setEarValue] = useState(0)
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([])
  
  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number>()
  const faceStableCounter = useRef(0)

  const getEAR = (eye: any[]) => {
    const p2_p6 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2))
    const p3_p5 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2))
    const p1_p4 = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2))
    return (p2_p6 + p3_p5) / (2.0 * p1_p4)
  }

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res.data.success) {
        const u = res.data.user
        setName(u.fullName || u.name)
        setStudentId(u.studentId || u.username)
        setEmail(u.email || 'N/A')
        setPhone(u.phone || u.phoneNumber || 'N/A')
        const r = u.room || u.roomId
        setRoomInfo({ room: r?.roomNumber || 'P238', block: r?.block || 'Cơ sở 1' })
      }
    } catch (err) { console.error(err) }
  }

  const fetchRegistered = async () => {
    try {
      const res = await api.get('/face/students')
      if (res.data.success) setRegisteredStudents(res.data.data)
    } catch (err) { console.error(err) }
  }

  const registerFace = useCallback(async (descriptor: Float32Array) => {
    if (isLoading || message.type === 'success') return
    setIsLoading(true)
    try {
      const response = await api.post('/face/register', {
        name, studentId, email,
        room: roomInfo.room,
        block: roomInfo.block,
        phoneNumber: phone,
        faceDescriptor: Array.from(descriptor),
        role: userLocal?.role 
      })
      if (response.data.success) {
        setMessage({ type: 'success', text: `Đăng ký FaceID thành công cho ${name}!` })
        fetchRegistered()
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || ''
      setMessage({ type: 'error', text: serverMsg || 'Lỗi hệ thống' })
    } finally {
      setIsLoading(false)
    }
  }, [name, studentId, email, phone, roomInfo, userLocal, isLoading, message.type])

  const processFrame = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded || isLoading || message.type === 'success') {
      requestRef.current = requestAnimationFrame(processFrame)
      return
    }

    const video = webcamRef.current.video
    if (video && video.readyState === 4) {
      const d = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
                                    .withFaceLandmarks().withFaceDescriptor()
      if (d) {
        setFaceDetected(true)
        const landmarks = d.landmarks
        const ear = (getEAR(landmarks.getLeftEye()) + getEAR(landmarks.getRightEye())) / 2
        setEarValue(ear)
        
        faceStableCounter.current++
        if (ear < 0.28 || faceStableCounter.current > 60) { 
           await registerFace(d.descriptor)
           faceStableCounter.current = 0 
        }
      } else {
        setFaceDetected(false); faceStableCounter.current = 0
      }
    }
    requestRef.current = requestAnimationFrame(processFrame)
  }, [modelsLoaded, isLoading, registerFace, message.type])

  useEffect(() => {
    fetchProfile(); fetchRegistered()
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models_v2'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models_v2'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models_v2'),
        ])
        setModelsLoaded(true)
      } catch (err) { console.error(err) }
    }
    loadModels()
    requestRef.current = requestAnimationFrame(processFrame)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [processFrame])

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-800 rounded-2xl text-white shadow-xl">
            <ScanFace size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">FaceID Enrollment</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Single-Capture Mode Active</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:rotate-180 transition-all duration-500">
           <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {[
                 { label: 'Họ tên', val: name, icon: User },
                 { label: 'Mã cư dân', val: studentId, icon: Hash, color: 'text-indigo-600' },
                 { label: 'Vị trí', val: `${roomInfo.room} • ${roomInfo.block}`, icon: ShieldCheck },
                 { label: 'Email', val: email, icon: Mail }
               ].map((item, i) => (
                 <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><item.icon size={12}/> {item.label}</p>
                    <p className={`text-xs font-black truncate ${item.color || 'text-slate-900 dark:text-white'}`}>{item.val}</p>
                 </div>
               ))}
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 aspect-video mb-8 ring-1 ring-white/10 shadow-inner">
               {!modelsLoaded ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                   <Loader2 className="animate-spin text-indigo-500" size={50}/>
                   <p className="text-[10px] font-black tracking-widest uppercase opacity-40">AI CALIBRATING...</p>
                 </div>
               ) : (
                 <>
                   <Webcam audio={false} ref={webcamRef} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className={`w-[250px] h-[350px] border-2 border-dashed rounded-[100px] transition-all duration-700 ${faceDetected ? 'border-indigo-500 scale-105' : 'border-white/10'}`} />
                      <p className="mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
                         {faceDetected ? 'Hệ thống đang thu thập mặt...' : 'Vui lòng đưa mặt vào khung'}
                      </p>
                   </div>
                 </>
               )}
            </div>

            {message.text && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className={`p-6 rounded-[2rem] flex items-center gap-5 font-bold shadow-2xl ${
                  message.type === 'success' ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-red-500 text-white shadow-red-500/40'
                }`}>
                {message.type === 'success' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status Report</p>
                   <p className="text-lg">{message.text}</p>
                </div>
                {message.type === 'success' && <Zap className="animate-pulse" />}
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Users size={18} className="text-indigo-600" />
                Cư dân hệ thống ({registeredStudents.length})
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {registeredStudents.map((s) => (
                  <div key={s._id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-[9px] text-indigo-600 font-bold uppercase mt-0.5">{s.studentId}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
