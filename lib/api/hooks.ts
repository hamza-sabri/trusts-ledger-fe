import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  currenciesList,
  getCurrenciesListQueryKey,
  currenciesCreate,
  currenciesPartialUpdate,
  currenciesDestroy,
} from "./generated/currencies/currencies"

import {
  personsList,
  getPersonsListQueryKey,
} from "./generated/persons/persons"

import {
  trustsList,
  getTrustsListQueryKey,
  trustsCreate,
  trustsCreateWithPersonCreate,
  trustsPartialUpdate,
  trustsDestroy,
  trustsSummaryRetrieve,
  getTrustsSummaryRetrieveQueryKey,
  trustsHistoryList,
  getTrustsHistoryListQueryKey,
} from "./generated/trusts/trusts"

import type { CurrencyRequest, PatchedCurrencyRequest } from "./generated/model"
import type { TrustWithPersonRequest, PatchedTrustRequest } from "./generated/model"
import type { StatusEnum } from "./generated/model"

// ── Currencies ──────────────────────────────────────────
export function useCurrencies() {
  return useQuery({
    queryKey: getCurrenciesListQueryKey(),
    queryFn: async () => {
      const res = await currenciesList()
      return res.data.results
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CurrencyRequest) =>
      currenciesCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getCurrenciesListQueryKey() })
    },
  })
}

export function useUpdateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchedCurrencyRequest }) =>
      currenciesPartialUpdate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getCurrenciesListQueryKey() })
    },
  })
}

export function useDeleteCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => currenciesDestroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getCurrenciesListQueryKey() })
    },
  })
}

// ── Persons ─────────────────────────────────────────────
export function usePersons(search?: string) {
  const params = search ? { search } : undefined
  return useQuery({
    queryKey: getPersonsListQueryKey(params),
    queryFn: async () => {
      const res = await personsList(params)
      return res.data.results
    },
  })
}

// ── Trusts Summary ──────────────────────────────────────
export function useTrustsSummary() {
  return useQuery({
    queryKey: getTrustsSummaryRetrieveQueryKey(),
    queryFn: async () => {
      const res = await trustsSummaryRetrieve()
      return res.data
    },
  })
}

// ── Trust List ──────────────────────────────────────────
interface TrustFilters {
  status?: string
  currency?: string
  search?: string
  page?: number
  person?: number
}

export function useTrusts(filters: TrustFilters = {}) {
  const params: Record<string, unknown> = {}
  if (filters.status) params.status = filters.status as StatusEnum
  if (filters.currency) params.currency = Number(filters.currency)
  if (filters.search) params.search = filters.search
  if (filters.page) params.page = filters.page
  if (filters.person) params.person = filters.person

  return useQuery({
    queryKey: getTrustsListQueryKey(params as never),
    queryFn: async () => {
      const res = await trustsList(params as never)
      return res.data
    },
  })
}

// ── Trusts by Person ───────────────────────────────────
export function useTrustsByPerson(personId: number) {
  const params = { person: personId } as Record<string, unknown>
  return useQuery({
    queryKey: getTrustsListQueryKey(params as never),
    queryFn: async () => {
      const res = await trustsList(params as never)
      return res.data
    },
    enabled: !!personId,
  })
}

// ── Trust History ───────────────────────────────────────
export function useTrustHistory(id: string) {
  return useQuery({
    queryKey: getTrustsHistoryListQueryKey(id),
    queryFn: async () => {
      const res = await trustsHistoryList(id)
      return res.data
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  })
}

// ── Create Trust with inline person ─────────────────────
export function useCreateTrustWithPerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TrustWithPersonRequest) =>
      trustsCreateWithPersonCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getTrustsListQueryKey() })
      qc.invalidateQueries({ queryKey: getTrustsSummaryRetrieveQueryKey() })
      qc.invalidateQueries({ queryKey: getPersonsListQueryKey() })
    },
  })
}

// ── Update Trust ────────────────────────────────────────
export function useUpdateTrust() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchedTrustRequest }) =>
      trustsPartialUpdate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getTrustsListQueryKey() })
      qc.invalidateQueries({ queryKey: getTrustsSummaryRetrieveQueryKey() })
    },
  })
}

// ── Delete Trust ────────────────────────────────────────
export function useDeleteTrust() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => trustsDestroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getTrustsListQueryKey() })
      qc.invalidateQueries({ queryKey: getTrustsSummaryRetrieveQueryKey() })
    },
  })
}
