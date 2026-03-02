"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import { verifyLoginTotp } from "@/lib/api/two-factor"

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export type LoginResult =
  | { type: "success" }
  | { type: "requires_2fa"; temp_token: string }
  | { type: "requires_2fa_setup"; detail: string }

interface AuthContextType {
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<LoginResult>
  loginWithTotp: (tempToken: string, totpCode: string) => Promise<void>
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

  const completeLogin = useCallback(
    (jwt: string, _expiresIn: number) => {
      setCookie("auth_token", jwt, 180)
      setToken(jwt)
      router.push("/dashboard")
    },
    [router]
  )

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      // 403 = 2FA not configured yet
      if (res.status === 403) {
        const errorData = await res.json().catch(() => null)
        return {
          type: "requires_2fa_setup",
          detail:
            errorData?.detail ||
            "يجب تفعيل المصادقة الثنائية قبل تسجيل الدخول",
        }
      }

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

      const data = await res.json()

      // Check if 2FA verification is required (temp_token present, no access_token)
      if (data.temp_token) {
        return { type: "requires_2fa", temp_token: data.temp_token }
      }

      // Normal login — store token and redirect
      const jwt = (data as LoginResponse).access_token
      if (!jwt) throw new Error("لم يتم استلام رمز المصادقة")

      completeLogin(jwt, data.expires_in)
      return { type: "success" }
    },
    [completeLogin]
  )

  const loginWithTotp = useCallback(
    async (tempToken: string, totpCode: string) => {
      const data = await verifyLoginTotp(tempToken, totpCode)
      completeLogin(data.access_token, data.expires_in)
    },
    [completeLogin]
  )

  const logout = useCallback(() => {
    removeCookie("auth_token")
    setToken(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{ token, isLoading, login, loginWithTotp, logout }}
    >
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
