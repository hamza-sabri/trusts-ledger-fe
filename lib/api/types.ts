export type TrustStatus = "active" | "returned" | "pending" | "cancelled"
export type Currency = "USD" | "EUR" | "NIS"

export interface Trust {
  id: number
  person_name: string
  amount: string
  currency: Currency
  status: TrustStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface TrustCreate {
  person_name: string
  amount: string
  currency: Currency
  status: TrustStatus
  notes?: string
}

export interface TrustUpdate {
  person_name?: string
  amount?: string
  currency?: Currency
  status?: TrustStatus
  notes?: string
}

export interface TrustSummary {
  total_usd: number
  total_eur: number
  total_nis: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
