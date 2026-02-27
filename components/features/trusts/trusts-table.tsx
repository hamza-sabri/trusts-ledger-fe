"use client"

import { useRef, useEffect } from "react"
import { useTrusts, useUpdateTrust, useDeleteTrust } from "@/lib/api/trusts"
import type { Trust, TrustStatus } from "@/lib/api/types"
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "./status-badge"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import gsap from "gsap"

interface TrustsTableProps {
  filters: { status: string; currency: string; search: string }
  onEdit: (trust: Trust) => void
  onDelete: (trust: Trust) => void
}

export function TrustsTable({ filters, onEdit, onDelete }: TrustsTableProps) {
  const { data, isLoading, isError } = useTrusts(filters)
  const updateTrust = useUpdateTrust()
  const rowsRef = useRef<HTMLTableSectionElement>(null)

  const trusts: Trust[] = Array.isArray(data)
    ? data
    : data && "results" in data
    ? data.results
    : []

  useEffect(() => {
    if (trusts.length > 0 && rowsRef.current) {
      const rows = rowsRef.current.querySelectorAll("tr")
      gsap.fromTo(
        rows,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
        }
      )
    }
  }, [trusts])

  async function handleStatusChange(trust: Trust, newStatus: TrustStatus) {
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
          <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-destructive/10 p-6 text-center text-sm text-destructive">
        فشل في تحميل الأمانات
      </div>
    )
  }

  if (trusts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <svg
            className="h-8 w-8 text-muted-foreground"
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
      <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-right font-semibold">اسم الشخص</TableHead>
              <TableHead className="text-right font-semibold">المبلغ</TableHead>
              <TableHead className="text-right font-semibold">العملة</TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">تاريخ الإضافة</TableHead>
              <TableHead className="text-right font-semibold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={rowsRef}>
            {trusts.map((trust) => (
              <TableRow key={trust.id} className="group">
                <TableCell className="font-medium">{trust.person_name}</TableCell>
                <TableCell className="tabular-nums" dir="ltr">
                  {formatAmount(trust.amount)}
                </TableCell>
                <TableCell>{trust.currency}</TableCell>
                <TableCell>
                  <Select
                    value={trust.status}
                    onValueChange={(v) =>
                      handleStatusChange(trust, v as TrustStatus)
                    }
                  >
                    <SelectTrigger className="w-28 h-8 rounded-lg border-0 bg-transparent p-0 hover:bg-muted/50">
                      <StatusBadge status={trust.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="returned">مُرجع</SelectItem>
                      <SelectItem value="pending">معلّق</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(trust.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => onEdit(trust)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">تعديل</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => onDelete(trust)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {trusts.map((trust) => (
          <div
            key={trust.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-card-foreground">{trust.person_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(trust.created_at)}
                </p>
              </div>
              <StatusBadge status={trust.status} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-card-foreground tabular-nums" dir="ltr">
                  {formatAmount(trust.amount)}
                </span>
                <span className="text-xs text-muted-foreground">{trust.currency}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onEdit(trust)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">تعديل</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
                  onClick={() => onDelete(trust)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
