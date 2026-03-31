import { setToken } from "@/api"
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

interface User {
  username: string
  name?: string
  role: 'admin' | 'user'
  token: string
}

interface UserContextType {
  user: User | null
  loginUser: (userData: Omit<User, 'token'>, token: string) => void
  logoutUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    if (!saved) return null

    const parsed = JSON.parse(saved)
    return {
      ...parsed,
      role: parsed.role === 'admin' ? 'admin' : 'user',
    }
  })

  useEffect(() => {
    if (user?.token) {
      setToken(user.token)
    }
  }, [user])

  const loginUser = (userData: Omit<User, 'token'>, token: string) => {
    const data = { ...userData, token }
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(token)
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setToken('')
  }

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}
