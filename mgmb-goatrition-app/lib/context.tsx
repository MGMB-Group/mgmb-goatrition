'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from './types'
import { usersStore, sessionStore } from './store'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (userId: string) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(() => {
    const sessionId = sessionStore.get()
    if (sessionId) {
      const found = usersStore.findById(sessionId)
      setUser(found ?? null)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(
    (userId: string) => {
      sessionStore.set(userId)
      loadUser()
    },
    [loadUser],
  )

  const logout = useCallback(() => {
    sessionStore.clear()
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    loadUser()
  }, [loadUser])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
