const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://trusts-ledger.clinixa.cloud"

function getToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(^| )auth_token=([^;]+)/)
  return match ? decodeURIComponent(match[2]) : null
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      window.location.href = "/login"
    }
    throw new Error("غير مصرح")
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(
      errorData?.detail || errorData?.message || `خطأ في الطلب: ${res.status}`
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}
