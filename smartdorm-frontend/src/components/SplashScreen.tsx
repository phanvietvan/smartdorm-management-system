import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinished?: () => void
  duration?: number
}

export default function SplashScreen({ onFinished, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onFinished) setTimeout(onFinished, 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onFinished])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Ultra-Clear Luxurious Modern Background */}
          <div className="absolute inset-0">
            {/* Background Image - Absolute Sharpness */}
            <motion.div 
              initial={{ scale: 1.02, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center blur-none"
            />
            {/* Minimal Dark Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-baseline"
            >
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter flex items-baseline select-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c72ed] via-[#ba67d9] to-[#d946ef]">
                  SmartDorm
                </span>
                <span className="text-[#d946ef] ml-0.5 sm:ml-1">.</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100px", opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#ba67d9]/40 to-transparent mt-6 sm:mt-8"
            />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.8 }}
              className="text-white text-[10px] uppercase font-bold tracking-[0.6em] mt-6"
            >
              Excellence in every stay
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
