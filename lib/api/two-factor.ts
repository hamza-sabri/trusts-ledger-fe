import { customInstance } from "./custom-instance"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://trusts-ledger.clinixa.cloud"

// --- Types ---

export interface TwoFactorStatus {
  is_2fa_enabled: boolean
  backup_codes_remaining: number
}

export interface TwoFactorSetup {
  qr_code: string
  secret: string
}

export interface TwoFactorConfirm {
  backup_codes: string[]
}

export interface TwoFactorVerifyLogin {
  access_token: string
  token_type: string
  expires_in: number
}

export interface BackupCodesRegenerate {
  backup_codes: string[]
}

// --- Unauthenticated (uses raw fetch, no Bearer) ---

export async function verifyLoginTotp(
  tempToken: string,
  totpCode: string
): Promise<TwoFactorVerifyLogin> {
  const res = await fetch(`${API_BASE}/api/2fa/verify-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temp_token: tempToken, totp_code: totpCode }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    if (res.status === 401) {
      throw new Error(errorData?.detail || "رمز التحقق غير صحيح")
    }
    if (res.status === 400) {
      throw new Error(errorData?.detail || "انتهت صلاحية الجلسة")
    }
    throw new Error(errorData?.detail || "فشل التحقق")
  }

  return res.json()
}

// --- Authenticated (uses customInstance with Bearer) ---

export async function get2faStatus(): Promise<TwoFactorStatus> {
  const res = await customInstance<{ data: TwoFactorStatus }>(
    "/api/2fa/status/",
    { method: "GET" }
  )
  return res.data
}

export async function setup2fa(): Promise<TwoFactorSetup> {
  const res = await customInstance<{ data: TwoFactorSetup }>(
    "/api/2fa/setup/",
    { method: "POST" }
  )
  return res.data
}

export async function confirmSetup2fa(
  totpCode: string
): Promise<TwoFactorConfirm> {
  const res = await customInstance<{ data: TwoFactorConfirm }>(
    "/api/2fa/confirm-setup/",
    {
      method: "POST",
      body: JSON.stringify({ totp_code: totpCode }),
    }
  )
  return res.data
}

export async function disable2fa(totpCode: string): Promise<void> {
  await customInstance("/api/2fa/disable/", {
    method: "POST",
    body: JSON.stringify({ totp_code: totpCode }),
  })
}

export async function regenerateBackupCodes(
  totpCode: string
): Promise<BackupCodesRegenerate> {
  const res = await customInstance<{ data: BackupCodesRegenerate }>(
    "/api/2fa/backup-codes/regenerate/",
    {
      method: "POST",
      body: JSON.stringify({ totp_code: totpCode }),
    }
  )
  return res.data
}
