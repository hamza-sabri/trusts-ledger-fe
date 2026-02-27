import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "./client"
import type {
  Trust,
  TrustRequest,
  TrustPatchRequest,
  TrustWithPersonRequest,
  TrustSummary,
  TrustHistory,
  Currency,
  Person,
  PaginatedResponse,
} from "./types"

// ── Query Keys ──────────────────────────────────────────
export const trustKeys = {
  all: ["trusts"] as const,
  lists: () => [...trustKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...trustKeys.lists(), filters] as const,
  details: () => [...trustKeys.all, "detail"] as const,
  detail: (id: string) => [...trustKeys.details(), id] as const,
  summary: () => [...trustKeys.all, "summary"] as const,
  history: (id: string) => [...trustKeys.all, "history", id] as const,
  allHistory: () => [...trustKeys.all, "allHistory"] as const,
}

export const currencyKeys = {
  all: ["currencies"] as const,
  list: () => [...currencyKeys.all, "list"] as const,
}

export const personKeys = {
  all: ["persons"] as const,
  list: (search?: string) => [...personKeys.all, "list", search ?? ""] as const,
}

// ── Currencies ──────────────────────────────────────────
export function useCurrencies() {
  return useQuery({
    queryKey: currencyKeys.list(),
    queryFn: async () => {
      const data = await apiClient<PaginatedResponse<Currency>>("/api/currencies/")
      return data.results
    },
    staleTime: 1000 * 60 * 10, // currencies rarely change
  })
}

// ── Persons ─────────────────────────────────────────────
export function usePersons(search?: string) {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  const queryString = params.toString()
  const endpoint = `/api/persons/${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: personKeys.list(search),
    queryFn: async () => {
      const data = await apiClient<PaginatedResponse<Person>>(endpoint)
      return data.results
    },
  })
}

// ── Summary ─────────────────────────────────────────────
export function useTrustsSummary() {
  return useQuery({
    queryKey: trustKeys.summary(),
    queryFn: () => apiClient<TrustSummary>("/api/trusts/summary/"),
  })
}

// ── Trust List ──────────────────────────────────────────
interface TrustFilters {
  status?: string
  currency?: string
  search?: string
  page?: number
}

export function useTrusts(filters: TrustFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set("status", filters.status)
  if (filters.currency) params.set("currency", filters.currency)
  if (filters.search) params.set("search", filters.search)
  if (filters.page) params.set("page", String(filters.page))

  const queryString = params.toString()
  const endpoint = `/api/trusts/${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: trustKeys.list(filters as Record<string, string>),
    queryFn: () => apiClient<PaginatedResponse<Trust>>(endpoint),
  })
}

// ── Trust Detail ────────────────────────────────────────
export function useTrust(id: string) {
  return useQuery({
    queryKey: trustKeys.detail(id),
    queryFn: () => apiClient<Trust>(`/api/trusts/${id}/`),
    enabled: !!id,
  })
}

// ── Trust History ───────────────────────────────────────
export function useTrustHistory(id: string) {
  return useQuery({
    queryKey: trustKeys.history(id),
    queryFn: () =>
      apiClient<PaginatedResponse<TrustHistory>>(`/api/trusts/${id}/history/`),
    enabled: !!id,
  })
}

// ── Create Trust (standard) ─────────────────────────────
export function useCreateTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TrustRequest) =>
      apiClient<Trust>("/api/trusts/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trustKeys.all })
    },
  })
}

// ── Create Trust with inline person ─────────────────────
export function useCreateTrustWithPerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TrustWithPersonRequest) =>
      apiClient<Trust>("/api/trusts/create-with-person/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trustKeys.all })
      queryClient.invalidateQueries({ queryKey: personKeys.all })
    },
  })
}

// ── Update Trust ────────────────────────────────────────
export function useUpdateTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TrustPatchRequest }) =>
      apiClient<Trust>(`/api/trusts/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: trustKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: trustKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trustKeys.summary() })
    },
  })
}

// ── Delete Trust ────────────────────────────────────────
export function useDeleteTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/trusts/${id}/`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trustKeys.all })
    },
  })
}
