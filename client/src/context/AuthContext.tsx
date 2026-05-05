import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, loginUser } from '../api/auth.api'
import PageLoader from '../components/PageLoader'
import type { User } from '../types/index'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (nextUser: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('roviks_token'))
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    localStorage.removeItem('roviks_token')
    localStorage.removeItem('roviks_user')
    setUser(null)
    setToken(null)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('roviks_token')

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getMe()
        const me = (response.data?.user ?? response.data) as User | undefined
        if (!me) {
          throw new Error('Unable to restore session')
        }
        setUser(me)
        setToken(storedToken)
        localStorage.setItem('roviks_user', JSON.stringify(me))
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          clearSession()
        }
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [clearSession])

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password })
    const authToken = response.data?.token as string | undefined
    const loggedInUser = response.data?.user as User | undefined

    if (!authToken || !loggedInUser) {
      throw new Error('Invalid login response')
    }

    localStorage.setItem('roviks_token', authToken)
    localStorage.setItem('roviks_user', JSON.stringify(loggedInUser))
    setToken(authToken)
    setUser(loggedInUser)

    if (loggedInUser.role === 'admin' && loggedInUser.isApproved) {
      navigate('/admin')
    } else if (loggedInUser.role === 'dropshipper' && loggedInUser.isApproved) {
      navigate('/dashboard')
    } else if (loggedInUser.role === 'dropshipper' && !loggedInUser.isApproved) {
      navigate('/pending')
    }

    return loggedInUser
  }

  const logout = () => {
    clearSession()
    navigate('/')
  }

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser)
    localStorage.setItem('roviks_user', JSON.stringify(nextUser))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [isLoading, token, updateUser, user],
  )

  if (isLoading) {
    return <PageLoader />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
