"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import type { LoginResponse } from "@/lib/api/types"

interface AuthContextType {
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://trusts-ledger.clinixa.cloud"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = getCookie("auth_token")
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(
        errorData?.detail ||
        errorData?.non_field_errors?.[0] ||
        errorData?.username?.[0] ||
        errorData?.password?.[0] ||
        "فشل تسجيل الدخول"
      )
    }
    const data: LoginResponse = await res.json()
    const jwt = data.access_token
    if (!jwt) throw new Error("لم يتم استلام رمز المصادقة")

    // Calculate expiry days from expires_in (seconds)
    const expiryDays = Math.max(1, Math.floor(data.expires_in / 86400))
    setCookie("auth_token", jwt, expiryDays)
    setToken(jwt)
    router.push("/dashboard")
  }, [router])

  const logout = useCallback(() => {
    removeCookie("auth_token")
    setToken(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
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
