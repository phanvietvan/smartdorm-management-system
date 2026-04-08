import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 400) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-10 right-28 z-[150] w-14 h-14 bg-[#4b49cb] text-white rounded-2xl shadow-[0_15px_40px_rgba(75,73,203,0.4)] hover:bg-[#3e3bbf] hover:shadow-[0_20px_50px_rgba(75,73,203,0.6)] hover:-translate-y-2 transition-all flex items-center justify-center group"
          aria-label="Back to top"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-[#4b49cb] blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
          
          <ArrowUp className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
