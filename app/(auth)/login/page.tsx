"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Shield, ArrowRight } from "lucide-react"

type Step = "credentials" | "totp"

export default function LoginPage() {
  const { login, loginWithTotp } = useAuth()
  const [step, setStep] = useState<Step>("credentials")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const totpInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === "totp") {
      totpInputRef.current?.focus()
    }
  }, [step])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const result = await login(username, password)
      if (result.type === "requires_2fa") {
        setTempToken(result.temp_token)
        setStep("totp")
      } else if (result.type === "requires_2fa_setup") {
        setError(result.detail)
      }
      // "success" — redirect happens in auth context
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!totpCode.trim()) return
    setError("")
    setIsLoading(true)
    try {
      await loginWithTotp(tempToken, totpCode.trim())
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "فشل التحقق"
      // Session expired → go back to credentials
      if (message.includes("صلاحية") || message.includes("expired")) {
        setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى")
        handleBackToLogin()
      } else {
        setError(message)
        setTotpCode("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleTotpChange(value: string) {
    // Allow digits (6-digit TOTP) and alphanumeric (8-char backup codes)
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)
    setTotpCode(cleaned)

    // Auto-submit on 6 digits
    if (/^\d{6}$/.test(cleaned) && !isLoading) {
      setError("")
      setIsLoading(true)
      loginWithTotp(tempToken, cleaned)
        .catch((err) => {
          const message =
            err instanceof Error ? err.message : "فشل التحقق"
          if (message.includes("صلاحية") || message.includes("expired")) {
            setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى")
            handleBackToLogin()
          } else {
            setError(message)
            setTotpCode("")
          }
        })
        .finally(() => setIsLoading(false))
    }
  }

  function handleBackToLogin() {
    setStep("credentials")
    setTempToken("")
    setTotpCode("")
    setError("")
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Form Panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div
            className="lg:hidden flex flex-col items-center gap-4 mb-10 animate-fade-up"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">سجل الأمانات</h1>
          </div>

          {step === "credentials" ? (
            /* Credentials step */
            <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  تسجيل الدخول
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  أدخل اسم المستخدم وكلمة المرور للوصول إلى سجل الأمانات
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive text-center animate-scale-fade-in">
                    {error}
                  </div>
                )}

                <div
                  className="flex flex-col gap-2 animate-fade-up"
                  style={{ animationDelay: "150ms" }}
                >
                  <Label htmlFor="username" className="text-sm font-medium">
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 rounded-xl text-base border-border/60 focus:border-primary"
                    autoComplete="username"
                  />
                </div>

                <div
                  className="flex flex-col gap-2 animate-fade-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <Label htmlFor="password" className="text-sm font-medium">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl text-base pe-12 border-border/60 focus:border-primary"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div
                  className="animate-fade-up"
                  style={{ animationDelay: "250ms" }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl text-base font-semibold mt-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </Button>
                </div>
              </form>

              <p
                className="mt-8 text-center text-xs text-muted-foreground animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                {"تواصل مع المسؤول إذا لم يكن لديك حساب"}
              </p>
            </div>
          ) : (
            /* TOTP verification step */
            <div className="animate-fade-up">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  رمز التحقق
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة
                </p>
              </div>

              <form onSubmit={handleTotpSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive text-center animate-scale-fade-in">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="totp" className="text-sm font-medium">
                    رمز التحقق
                  </Label>
                  <Input
                    ref={totpInputRef}
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => handleTotpChange(e.target.value)}
                    maxLength={8}
                    className="h-12 rounded-xl text-center text-2xl tracking-[0.3em] font-mono border-border/60 focus:border-primary"
                    dir="ltr"
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !totpCode.trim()}
                  className="w-full h-12 rounded-xl text-base font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "تحقق"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                أو أدخل رمز احتياطي مكوّن من 6 أحرف
              </p>

              <button
                onClick={handleBackToLogin}
                className="mt-6 flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                العودة لتسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5 items-center justify-center dot-grid">
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 animate-fade-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
            <Shield className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              سجل الأمانات
            </h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-sm leading-relaxed">
              إدارة ومتابعة الأمانات المالية بسهولة وأمان
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/5" />
        <div className="absolute -top-16 -end-16 h-48 w-48 rounded-full bg-primary/8" />
      </div>
    </div>
  )
}
