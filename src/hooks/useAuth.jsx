import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async (username, password) => {
    setLoading(true)
    setError('')
    try {
      const res = await auth.login(username, password)
      const t = res.data.access_token
      localStorage.setItem('token', t)
      setToken(t)
      return true
    } catch (e) {
      setError(e.response?.data?.detail || 'Login ไม่สำเร็จ')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
