"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react"
import gsap from "gsap"

export default function SignupPage() {
  const { signup } = useAuth()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      )
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await signup(email, password, firstName, lastName)
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء الحساب")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 bg-background">
      <div ref={cardRef} className="w-full max-w-md">
        <Card className="shadow-xl rounded-2xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              إنشاء حساب جديد
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              سجّل حسابك للبدء في استخدام سجل الأمانات
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="محمد"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 rounded-xl text-base"
                    autoComplete="given-name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="أحمد"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 rounded-xl text-base"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl text-base"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 rounded-xl text-base pe-12"
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 rounded-xl text-base font-semibold mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "إنشاء الحساب"
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"لديك حساب بالفعل؟"}{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
