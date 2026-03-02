"use client"

import { useRef } from "react"
import { useTrusts, useUpdateTrust } from "@/lib/api/hooks"
import type { Trust } from "@/lib/api/generated/model"
import type { StatusEnum } from "@/lib/api/generated/model"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "./status-badge"
import { toast } from "sonner"

interface TrustsTableProps {
  filters: { status: string; currency: string; search: string }
  onEdit: (trust: Trust) => void
}

export function TrustsTable({ filters, onEdit }: TrustsTableProps) {
  const { data, isLoading, isError } = useTrusts(filters)
  const updateTrust = useUpdateTrust()
  const hasAnimated = useRef(false)

  const trusts: Trust[] = data?.results ?? []

  // Only animate on first data load
  const shouldAnimate = !hasAnimated.current && trusts.length > 0
  if (trusts.length > 0) {
    hasAnimated.current = true
  }

  async function handleStatusChange(trust: Trust, newStatus: StatusEnum) {
    try {
      await updateTrust.mutateAsync({
        id: trust.id,
        data: { status: newStatus },
      })
      toast.success("تم تحديث الحالة بنجاح")
    } catch {
      toast.error("فشل تحديث الحالة")
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  function formatAmount(amount: string) {
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-2xl border border-border/50"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="h-5 w-28 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-20 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-16 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-16 rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-center text-sm text-destructive">
        فشل في تحميل الأمانات
      </div>
    )
  }

  if (trusts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 border-dashed p-12 text-center animate-fade-up">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/70">
          <svg
            className="h-8 w-8 text-muted-foreground/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">
          لا توجد أمانات حالياً
        </p>
        <p className="text-sm text-muted-foreground">
          ابدأ بإضافة أمانة جديدة
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">التاريخ</TableHead>
              <TableHead className="font-semibold">اسم الشخص</TableHead>
              <TableHead className="font-semibold">رقم الهاتف</TableHead>
              <TableHead className="font-semibold">المبلغ</TableHead>
              <TableHead className="font-semibold">العملة</TableHead>
              <TableHead className="font-semibold">الحالة</TableHead>
              <TableHead className="font-semibold">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trusts.map((trust, index) => (
              <TableRow
                key={trust.id}
                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onEdit(trust)}
                style={
                  shouldAnimate
                    ? {
                        animation: "slide-in-right 0.3s ease-out both",
                        animationDelay: `${index * 40}ms`,
                      }
                    : undefined
                }
              >
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(trust.created_at)}
                </TableCell>
                <TableCell className="font-medium">
                  {trust.person.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {trust.person.phone || "—"}
                </TableCell>
                <TableCell className="tabular-nums font-medium">
                  {formatAmount(trust.amount)}
                </TableCell>
                <TableCell>{trust.currency.code}</TableCell>
                <TableCell>
                  <Select
                    value={trust.status}
                    onValueChange={(v) =>
                      handleStatusChange(trust, v as StatusEnum)
                    }
                  >
                    <SelectTrigger
                      className="w-28 h-8 rounded-lg border-0 bg-transparent p-0 hover:bg-muted/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusBadge status={trust.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="returned">مُرجع</SelectItem>
                      <SelectItem value="pending">معلّق</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                  {trust.notes
                    ? trust.notes.length > 50
                      ? `${trust.notes.slice(0, 50)}...`
                      : trust.notes
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {trusts.map((trust, index) => (
          <div
            key={trust.id}
            onClick={() => onEdit(trust)}
            className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200"
            style={
              shouldAnimate
                ? {
                    animation: "fade-up 0.4s ease-out both",
                    animationDelay: `${index * 50}ms`,
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(trust.created_at)}
                </p>
                <p className="font-semibold text-card-foreground mt-0.5">
                  {trust.person.name}
                </p>
                {trust.person.phone && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {trust.person.phone}
                  </p>
                )}
              </div>
              <StatusBadge status={trust.status} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold text-card-foreground tabular-nums"
                dir="ltr"
              >
                {formatAmount(trust.amount)}
              </span>
              <span className="text-xs text-muted-foreground">
                {trust.currency.code}
              </span>
            </div>
            {trust.notes && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {trust.notes.length > 50
                  ? `${trust.notes.slice(0, 50)}...`
                  : trust.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
