"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { usePersons, useTrustsByPerson, useTrustHistory } from "@/lib/api/hooks"
import type { Person, Trust, TrustHistory } from "@/lib/api/generated/model"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/features/trusts/status-badge"
import {
  Search,
  User,
  Phone,
  ChevronLeft,
  History,
  Plus,
  Pencil,
  Minus,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function PersonsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const { data: persons, isLoading } = usePersons(debouncedSearch || undefined)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim())
    }, 300)
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الأشخاص</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          عرض الأشخاص وأماناتهم وسجل التغييرات
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث عن شخص..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-11 rounded-xl pe-10 text-sm border-border/60 focus:border-primary"
        />
      </div>

      {/* Persons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full skeleton-shimmer" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
                  <div className="h-3 w-20 rounded-lg skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !persons || persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 border-dashed p-12 text-center animate-fade-up">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/70">
            <User className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            لا يوجد أشخاص
          </p>
          <p className="text-sm text-muted-foreground">
            سيظهر الأشخاص هنا عند إضافة أمانات
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {persons.map((person, index) => (
            <button
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className="group p-5 rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 text-start"
              style={{
                animation: "fade-up 0.4s ease-out both",
                animationDelay: `${index * 40}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg group-hover:bg-primary/15 transition-colors">
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {person.name}
                  </p>
                  {person.phone ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span dir="ltr" className="truncate">{person.phone}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      بدون رقم هاتف
                    </p>
                  )}
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Person Detail Modal */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          open={!!selectedPerson}
          onOpenChange={(open) => {
            if (!open) setSelectedPerson(null)
          }}
        />
      )}
    </div>
  )
}

// ── Person Detail Modal ──────────────────────────────────

function PersonDetailModal({
  person,
  open,
  onOpenChange,
}: {
  person: Person
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading } = useTrustsByPerson(person.id)
  const [expandedTrust, setExpandedTrust] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const hasAutoExpanded = useRef(false)

  const trusts = data?.results ?? []

  // Auto-expand the latest trust when data first loads
  useEffect(() => {
    if (!hasAutoExpanded.current && trusts.length > 0) {
      setExpandedTrust(trusts[0].id)
      hasAutoExpanded.current = true
    }
  }, [trusts])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[85dvh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {person.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg truncate">
                {person.name}
              </DialogTitle>
              {person.phone && (
                <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                  {person.phone}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Time filter */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 rounded-lg text-xs w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trusts list */}
        <div className="flex-1 overflow-y-auto mt-3 -mx-6 px-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : trusts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              لا توجد أمانات لهذا الشخص
            </p>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              {trusts.map((trust) => (
                <TrustCard
                  key={trust.id}
                  trust={trust}
                  timeFilter={timeFilter}
                  isExpanded={expandedTrust === trust.id}
                  onToggle={() =>
                    setExpandedTrust(
                      expandedTrust === trust.id ? null : trust.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Trust Card inside modal ─────────────────────────────

function TrustCard({
  trust,
  timeFilter,
  isExpanded,
  onToggle,
}: {
  trust: Trust
  timeFilter: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const amount = parseFloat(trust.amount)
  const formatted = isNaN(amount)
    ? trust.amount
    : amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

  const date = new Date(trust.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="rounded-xl border border-border/40 bg-muted/15 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors text-start"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold tabular-nums text-foreground" dir="ltr">
              {formatted}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {trust.currency.code}
            </span>
            <StatusBadge status={trust.status} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{date}</p>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          <History className="h-3.5 w-3.5" />
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "-rotate-90"
            )}
          />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <TrustHistoryTimeline trustId={trust.id} timeFilter={timeFilter} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── History Timeline ────────────────────────────────────

function TrustHistoryTimeline({
  trustId,
  timeFilter,
}: {
  trustId: string
  timeFilter: string
}) {
  const { data, isLoading } = useTrustHistory(trustId)

  // API may return a plain array or a paginated { results } object
  let history: TrustHistory[] = Array.isArray(data) ? data : (data?.results ?? [])

  // Client-side time filter
  if (timeFilter !== "all") {
    const now = Date.now()
    const ms: Record<string, number> = {
      "7d": 7 * 86400000,
      "30d": 30 * 86400000,
      "90d": 90 * 86400000,
      "1y": 365 * 86400000,
    }
    const cutoff = now - (ms[timeFilter] ?? 0)
    history = history.filter(
      (h) => new Date(h.history_date).getTime() >= cutoff
    )
  }

  if (isLoading) {
    return (
      <div className="px-4 pb-3 pt-1">
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="px-4 pb-3 pt-1 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center py-3">
          {timeFilter !== "all"
            ? "لا توجد تغييرات في هذه الفترة"
            : "لا يوجد سجل تغييرات"}
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-3 pt-1 border-t border-border/30">
      <p className="text-xs font-semibold text-muted-foreground mb-2.5 mt-2">
        سجل التغييرات
      </p>
      <div className="relative">
        <div className="absolute start-[11px] top-2 bottom-2 w-px bg-border/60" />
        <div className="flex flex-col">
          {history.map((entry, index) => (
            <HistoryEntry
              key={entry.history_id}
              entry={entry}
              isLast={index === history.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Single History Entry ────────────────────────────────

function HistoryEntry({
  entry,
  isLast,
}: {
  entry: TrustHistory
  isLast: boolean
}) {
  const typeConfig = getHistoryTypeConfig(entry.history_type)

  const date = new Date(entry.history_date)
  const formatted = date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const time = date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const amount = parseFloat(entry.amount)
  const formattedAmount = isNaN(amount)
    ? entry.amount
    : amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

  const statusLabels: Record<string, string> = {
    active: "نشط",
    returned: "مُرجع",
    pending: "معلّق",
    cancelled: "ملغي",
    delivered: "تم التسليم",
  }

  return (
    <div className={cn("relative flex gap-3 py-2", !isLast && "pb-3")}>
      <div
        className={cn(
          "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-background",
          typeConfig.dotBorder
        )}
      >
        <typeConfig.icon className={cn("h-3 w-3", typeConfig.iconColor)} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 rounded-md",
              typeConfig.badgeClass
            )}
          >
            {typeConfig.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {formatted} · {time}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground">
          <span>
            <span className="text-muted-foreground">المبلغ:</span>{" "}
            <span className="font-medium tabular-nums" dir="ltr">
              {formattedAmount}
            </span>{" "}
            <span className="text-muted-foreground font-mono text-[10px]">
              {entry.currency_code}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">الحالة:</span>{" "}
            <span className="font-medium">
              {statusLabels[entry.status] || entry.status}
            </span>
          </span>
        </div>
        {entry.changed_by && (
          <p className="text-[10px] text-muted-foreground mt-1">
            بواسطة: {entry.changed_by}
          </p>
        )}
        {entry.notes && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            ملاحظات: {entry.notes}
          </p>
        )}
      </div>
    </div>
  )
}

function getHistoryTypeConfig(type: string) {
  switch (type) {
    case "+":
      return {
        label: "إنشاء",
        icon: Plus,
        dotBorder: "border-emerald-500",
        iconColor: "text-emerald-500",
        badgeClass:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      }
    case "~":
      return {
        label: "تعديل",
        icon: Pencil,
        dotBorder: "border-blue-500",
        iconColor: "text-blue-500",
        badgeClass:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      }
    case "-":
      return {
        label: "حذف",
        icon: Minus,
        dotBorder: "border-red-500",
        iconColor: "text-red-500",
        badgeClass:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      }
    default:
      return {
        label: type,
        icon: History,
        dotBorder: "border-muted-foreground",
        iconColor: "text-muted-foreground",
        badgeClass: "bg-muted text-muted-foreground border-border",
      }
  }
}
