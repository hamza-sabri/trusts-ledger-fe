// ── Status ──────────────────────────────────────────────
export type TrustStatus = "active" | "returned" | "pending" | "cancelled"

// ── Currency ────────────────────────────────────────────
export interface Currency {
  id: number
  code: string
  name: string
}

// ── Person ──────────────────────────────────────────────
export interface Person {
  id: number
  name: string
  phone?: string | null
}

// ── Trust ───────────────────────────────────────────────
export interface Trust {
  id: string // UUID
  person: Person
  amount: string
  currency: Currency
  status: TrustStatus
  notes: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

// ── Trust mutations ─────────────────────────────────────
export interface TrustRequest {
  person_id: number
  amount: string
  currency_id: number
  status?: TrustStatus
  notes?: string
}

export interface TrustPatchRequest {
  person_id?: number
  amount?: string
  currency_id?: number
  status?: TrustStatus
  notes?: string
}

export interface InlinePersonRequest {
  name: string
  phone?: string | null
}

export interface TrustWithPersonRequest {
  person_id?: number | null
  person?: InlinePersonRequest | null
  amount: string
  currency_id: number
  status?: TrustStatus
  notes?: string
}

// ── Summary ─────────────────────────────────────────────
export interface TrustSummaryItem {
  currency_code: string
  currency_name: string
  total: string
}

export interface TrustSummary {
  totals: TrustSummaryItem[]
}

// ── History ─────────────────────────────────────────────
export interface TrustHistory {
  history_id: number
  history_date: string
  history_type: string
  history_change_reason: string | null
  changed_by: string | null
  person_id: number
  person_name: string
  amount: string
  currency_id: number
  currency_code: string
  status: string
  notes: string
  created_by_id: number | null
  updated_by_id: number | null
}

// ── Auth ────────────────────────────────────────────────
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// ── Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
