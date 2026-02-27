"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://trusts-ledger.clinixa.cloud"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = getCookie("auth_token")
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/user/`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        removeCookie("auth_token")
        setToken(null)
      }
    } catch {
      removeCookie("auth_token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.detail || errorData?.non_field_errors?.[0] || "فشل تسجيل الدخول")
    }
    const data = await res.json()
    const jwt = data.access || data.token || data.key
    if (!jwt) throw new Error("لم يتم استلام رمز المصادقة")
    setCookie("auth_token", jwt, 7)
    setToken(jwt)
    await fetchUser(jwt)
    router.push("/dashboard")
  }, [router])

  const signup = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    const res = await fetch(`${API_BASE}/api/auth/registration/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password1: password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
      }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMsg =
        errorData?.email?.[0] ||
        errorData?.password1?.[0] ||
        errorData?.non_field_errors?.[0] ||
        errorData?.detail ||
        "فشل إنشاء الحساب"
      throw new Error(errorMsg)
    }
    const data = await res.json()
    const jwt = data.access || data.token || data.key
    if (jwt) {
      setCookie("auth_token", jwt, 7)
      setToken(jwt)
      await fetchUser(jwt)
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  const logout = useCallback(() => {
    removeCookie("auth_token")
    setToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
