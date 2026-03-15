import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type User } from '../api/auth'

type GoogleLoginResult =
  | { state: 'approved'; message?: string }
  | { state: 'pending'; message?: string }
  | { state: 'blocked'; message?: string }

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  googleLogin: (credential: string) => Promise<GoogleLoginResult>
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (!token) return false
    if (!saved) return true
    try {
      const u = JSON.parse(saved)
      if (u.status !== 'approved') return true
    } catch {
      return true
    }
    return false
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const needsLoading = !user || user.status !== 'approved'
      if (needsLoading) setLoading(true)
      authApi.me()
        .then((r: { data: User }) => {
          setUser(r.data)
          localStorage.setItem('user', JSON.stringify(r.data))
        })
        .catch(() => { 
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null) 
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Sync user back to localStorage for persistence of updates (like roomId)
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const googleLogin = async (credential: string): Promise<GoogleLoginResult> => {
    try {
      const response = await authApi.googleLogin(credential)

      // 200 or 201 + token => approved, lưu token & user
      if (response.status === 200 || response.status === 201) {
        const data = response.data as { token: string; user: User }
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser(data.user)
          return { state: 'approved' }
        }
      }

      // Nếu 201 mà không có token thì mới coi là pending
      if (response.status === 201) {
        const message = (response.data as { message?: string })?.message
        return { state: 'pending', message }
      }

      // Các mã khác coi như blocked
      const message = (response.data as { message?: string })?.message
      return { state: 'blocked', message }
    } catch (err: any) {
      const status = err?.response?.status
      const message = err?.response?.data?.message as string | undefined

      if (status === 403) {
        // 403 + message pending/rejected
        return { state: 'blocked', message }
      }

      throw err
    }
  }

  const register = async (d: { email: string; password: string; fullName: string; phone?: string }) => {
    const { data } = await authApi.register(d)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
