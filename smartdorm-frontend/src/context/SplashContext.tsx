import React, { createContext, useContext, useState, useEffect } from 'react'
import SplashScreen from '../components/SplashScreen'

interface SplashContextType {
  showSplash: (duration?: number) => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [isShowing, setIsShowing] = useState(false)
  const [splashDuration, setSplashDuration] = useState(1500)

  // Auto show on first load
  useEffect(() => {
    setIsShowing(true)
  }, [])

  const showSplash = (duration: number = 1500) => {
    setSplashDuration(duration)
    setIsShowing(true)
  }

  return (
    <SplashContext.Provider value={{ showSplash }}>
      {isShowing && (
        <SplashScreen 
          duration={splashDuration} 
          onFinished={() => setIsShowing(false)} 
        />
      )}
      {children}
    </SplashContext.Provider>
  )
}

export function useSplash() {
  const context = useContext(SplashContext)
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider')
  }
  return context
}
