"use client"

import { useState, useEffect, useCallback } from "react"
import {
  get2faStatus,
  setup2fa,
  confirmSetup2fa,
  disable2fa,
  regenerateBackupCodes,
  type TwoFactorStatus,
} from "@/lib/api/two-factor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  Copy,
  Download,
  Check,
  KeyRound,
  RefreshCw,
} from "lucide-react"

type SetupStep = "idle" | "qr" | "backup"

export default function SecurityPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Setup flow state
  const [setupStep, setSetupStep] = useState<SetupStep>("idle")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [setupCode, setSetupCode] = useState("")
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  // Dialog state
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [regenDialogOpen, setRegenDialogOpen] = useState(false)
  const [dialogCode, setDialogCode] = useState("")
  const [dialogLoading, setDialogLoading] = useState(false)
  const [dialogError, setDialogError] = useState("")

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const data = await get2faStatus()
      setStatus(data)
    } catch {
      setError("فشل في تحميل حالة المصادقة الثنائية")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // --- Setup Flow ---

  async function handleStartSetup() {
    setSetupLoading(true)
    setSetupError("")
    try {
      const data = await setup2fa()
      setQrCode(data.qr_code)
      setSecret(data.secret)
      setSetupStep("qr")
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "فشل بدء الإعداد")
    } finally {
      setSetupLoading(false)
    }
  }

  async function handleConfirmSetup(e: React.FormEvent) {
    e.preventDefault()
    if (!setupCode.trim()) return
    setSetupLoading(true)
    setSetupError("")
    try {
      const data = await confirmSetup2fa(setupCode.trim())
      setBackupCodes(data.backup_codes)
      setSetupStep("backup")
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "رمز التحقق غير صحيح")
      setSetupCode("")
    } finally {
      setSetupLoading(false)
    }
  }

  function handleSetupDone() {
    setSetupStep("idle")
    setQrCode("")
    setSecret("")
    setSetupCode("")
    setBackupCodes([])
    setSetupError("")
    fetchStatus()
  }

  // --- Copy / Download ---

  async function handleCopyAll() {
    await navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const content = [
      "سجل الأمانات - رموز احتياطية للمصادقة الثنائية",
      "Trusts Ledger - Two-Factor Authentication Backup Codes",
      "=" .repeat(50),
      "",
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
      "",
      "احتفظ بهذه الرموز في مكان آمن.",
      "كل رمز يمكن استخدامه مرة واحدة فقط.",
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopySecret() {
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Disable 2FA ---

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault()
    if (!dialogCode.trim()) return
    setDialogLoading(true)
    setDialogError("")
    try {
      await disable2fa(dialogCode.trim())
      setDisableDialogOpen(false)
      setDialogCode("")
      fetchStatus()
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "رمز التحقق غير صحيح")
      setDialogCode("")
    } finally {
      setDialogLoading(false)
    }
  }

  // --- Regenerate Backup Codes ---

  async function handleRegenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!dialogCode.trim()) return
    setDialogLoading(true)
    setDialogError("")
    try {
      const data = await regenerateBackupCodes(dialogCode.trim())
      setBackupCodes(data.backup_codes)
      setRegenDialogOpen(false)
      setDialogCode("")
      setSetupStep("backup")
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "رمز التحقق غير صحيح")
      setDialogCode("")
    } finally {
      setDialogLoading(false)
    }
  }

  function resetDialog() {
    setDialogCode("")
    setDialogError("")
    setDialogLoading(false)
  }

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الأمان</h1>
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="h-6 w-48 rounded-lg skeleton-shimmer" />
              <div className="h-4 w-72 rounded-lg skeleton-shimmer" />
              <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الأمان</h1>
        <Card>
          <CardContent>
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive text-center">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const is2faEnabled = status?.is_2fa_enabled ?? false

  // --- Backup codes display (shared between setup and regenerate) ---
  if (setupStep === "backup") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الأمان</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              الرموز الاحتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              احتفظ بهذه الرموز في مكان آمن. يمكنك استخدام كل رمز مرة واحدة
              فقط لتسجيل الدخول إذا فقدت الوصول إلى تطبيق المصادقة.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <div
                  key={code}
                  className="rounded-lg bg-muted px-3 py-2 text-center font-mono text-sm"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyAll}
                className="flex-1 rounded-xl"
              >
                {copied ? (
                  <Check className="h-4 w-4 ms-2" />
                ) : (
                  <Copy className="h-4 w-4 ms-2" />
                )}
                {copied ? "تم النسخ" : "نسخ الكل"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 rounded-xl"
              >
                <Download className="h-4 w-4 ms-2" />
                تحميل كملف
              </Button>
            </div>

            <Button
              onClick={handleSetupDone}
              className="w-full rounded-xl"
            >
              تم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- QR Code / Setup step ---
  if (setupStep === "qr") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الأمان</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              إعداد المصادقة الثنائية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              امسح رمز QR التالي باستخدام تطبيق المصادقة (مثل Google
              Authenticator أو Authy)
            </p>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="rounded-xl border p-4 bg-white">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="h-48 w-48"
                />
              </div>
            </div>

            {/* Secret key */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                أو أدخل المفتاح يدوياً
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono break-all select-all">
                  {secret}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopySecret}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Verify */}
            <form onSubmit={handleConfirmSetup} className="space-y-4">
              {setupError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center animate-scale-fade-in">
                  {setupError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="setup-code" className="text-sm font-medium">
                  رمز التحقق من التطبيق
                </Label>
                <Input
                  id="setup-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className="h-12 rounded-xl text-center text-2xl tracking-[0.3em] font-mono border-border/60 focus:border-primary"
                  dir="ltr"
                  autoComplete="one-time-code"
                  disabled={setupLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={setupLoading || setupCode.length < 6}
                className="w-full rounded-xl"
              >
                {setupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                ) : null}
                تفعيل
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => {
                setSetupStep("idle")
                setSetupError("")
                setSetupCode("")
              }}
              className="w-full text-muted-foreground"
            >
              إلغاء
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Main view ---
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الأمان</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {is2faEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            المصادقة الثنائية (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {is2faEnabled ? (
            /* 2FA Enabled — management view */
            <>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                  مفعّلة
                </Badge>
                <span className="text-sm text-muted-foreground">
                  الرموز الاحتياطية المتبقية:{" "}
                  <span className="font-semibold text-foreground">
                    {status?.backup_codes_remaining ?? 0}
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDialog()
                    setRegenDialogOpen(true)
                  }}
                  className="rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 ms-2" />
                  إعادة إنشاء الرموز الاحتياطية
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDialog()
                    setDisableDialogOpen(true)
                  }}
                  className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                >
                  <ShieldOff className="h-4 w-4 ms-2" />
                  تعطيل المصادقة الثنائية
                </Button>
              </div>
            </>
          ) : (
            /* 2FA Disabled — enable button */
            <>
              <p className="text-sm text-muted-foreground">
                أضف طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة الثنائية.
              </p>

              {setupError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center animate-scale-fade-in">
                  {setupError}
                </div>
              )}

              <Button
                onClick={handleStartSetup}
                disabled={setupLoading}
                className="rounded-xl"
              >
                {setupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 ms-2" />
                )}
                تفعيل المصادقة الثنائية
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Disable 2FA Dialog */}
      <Dialog
        open={disableDialogOpen}
        onOpenChange={(open) => {
          setDisableDialogOpen(open)
          if (!open) resetDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعطيل المصادقة الثنائية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDisable}>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                سيؤدي هذا إلى إزالة المصادقة الثنائية من حسابك. أدخل رمز
                التحقق من تطبيق المصادقة للتأكيد.
              </p>

              {dialogError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center animate-scale-fade-in">
                  {dialogError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="disable-code">رمز التحقق</Label>
                <Input
                  id="disable-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={dialogCode}
                  onChange={(e) =>
                    setDialogCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className="h-12 rounded-xl text-center text-xl tracking-[0.3em] font-mono"
                  dir="ltr"
                  autoComplete="one-time-code"
                  disabled={dialogLoading}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDisableDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={dialogLoading || dialogCode.length < 6}
              >
                {dialogLoading && (
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                )}
                تعطيل
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog
        open={regenDialogOpen}
        onOpenChange={(open) => {
          setRegenDialogOpen(open)
          if (!open) resetDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة إنشاء الرموز الاحتياطية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegenerate}>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                سيتم إلغاء جميع الرموز الاحتياطية الحالية وإنشاء رموز جديدة.
                أدخل رمز التحقق من تطبيق المصادقة للتأكيد.
              </p>

              {dialogError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center animate-scale-fade-in">
                  {dialogError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="regen-code">رمز التحقق</Label>
                <Input
                  id="regen-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={dialogCode}
                  onChange={(e) =>
                    setDialogCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className="h-12 rounded-xl text-center text-xl tracking-[0.3em] font-mono"
                  dir="ltr"
                  autoComplete="one-time-code"
                  disabled={dialogLoading}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRegenDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={dialogLoading || dialogCode.length < 6}
              >
                {dialogLoading && (
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                )}
                إعادة إنشاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
