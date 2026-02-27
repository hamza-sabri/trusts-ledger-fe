import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "./client"
import type {
  Trust,
  TrustCreate,
  TrustUpdate,
  TrustSummary,
  PaginatedResponse,
} from "./types"

export const trustKeys = {
  all: ["trusts"] as const,
  lists: () => [...trustKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...trustKeys.lists(), filters] as const,
  details: () => [...trustKeys.all, "detail"] as const,
  detail: (id: number) => [...trustKeys.details(), id] as const,
  summary: () => [...trustKeys.all, "summary"] as const,
}

export function useTrustsSummary() {
  return useQuery({
    queryKey: trustKeys.summary(),
    queryFn: () => apiClient<TrustSummary>("/api/trusts/summary/"),
  })
}

interface TrustFilters {
  status?: string
  currency?: string
  search?: string
}

export function useTrusts(filters: TrustFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set("status", filters.status)
  if (filters.currency) params.set("currency", filters.currency)
  if (filters.search) params.set("search", filters.search)

  const queryString = params.toString()
  const endpoint = `/api/trusts/${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: trustKeys.list(filters as Record<string, string>),
    queryFn: () => apiClient<PaginatedResponse<Trust> | Trust[]>(endpoint),
  })
}

export function useTrust(id: number) {
  return useQuery({
    queryKey: trustKeys.detail(id),
    queryFn: () => apiClient<Trust>(`/api/trusts/${id}/`),
    enabled: id > 0,
  })
}

export function useCreateTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TrustCreate) =>
      apiClient<Trust>("/api/trusts/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trustKeys.all })
    },
  })
}

export function useUpdateTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TrustUpdate }) =>
      apiClient<Trust>(`/api/trusts/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: trustKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: trustKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trustKeys.summary() })
    },
  })
}

export function useDeleteTrust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient<void>(`/api/trusts/${id}/`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trustKeys.all })
    },
  })
}
