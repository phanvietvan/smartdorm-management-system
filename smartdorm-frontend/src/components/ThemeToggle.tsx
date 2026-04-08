import { useRef, useEffect } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import themeToggleData from '../assets/theme-toggle.json'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  // Sync Lottie animation with theme state
  useEffect(() => {
    if (!lottieRef.current) return
    if (theme === 'dark') {
      lottieRef.current.playSegments([0, 90], true)
    } else {
      lottieRef.current.playSegments([90, 180], true)
    }
  }, [theme])

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-[63px] h-[37px] flex items-center justify-center rounded-full transition-all duration-500 overflow-hidden"
      title={theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
    >
      {/* Lottie Container */}
      <div className="w-full h-full">
        <Lottie
          lottieRef={lottieRef}
          animationData={themeToggleData}
          loop={false}
          autoplay={false}
          style={{ width: 63, height: 37 }}
        />
      </div>
    </motion.button>
  )
}
