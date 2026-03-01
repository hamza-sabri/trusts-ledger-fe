"use client"

import { useRef } from "react"
import { useCurrencies } from "@/lib/api/hooks"
import type { Currency } from "@/lib/api/generated/model"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface CurrenciesTableProps {
  onEdit: (currency: Currency) => void
  onDelete: (currency: Currency) => void
}

export function CurrenciesTable({ onEdit, onDelete }: CurrenciesTableProps) {
  const { data: currencies, isLoading, isError } = useCurrencies()
  const hasAnimated = useRef(false)

  const shouldAnimate = !hasAnimated.current && currencies && currencies.length > 0
  if (currencies && currencies.length > 0) {
    hasAnimated.current = true
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/50">
            <div className="h-5 w-16 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-16 rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-center text-sm text-destructive">
        فشل في تحميل العملات
      </div>
    )
  }

  if (!currencies || currencies.length === 0) {
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
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">
          لا توجد عملات حالياً
        </p>
        <p className="text-sm text-muted-foreground">
          ابدأ بإضافة عملة جديدة
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
              <TableHead className="font-semibold w-24">الرمز</TableHead>
              <TableHead className="font-semibold">الاسم</TableHead>
              <TableHead className="font-semibold w-28">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((currency, index) => (
              <TableRow
                key={currency.id}
                className="group hover:bg-muted/30 transition-colors"
                style={
                  shouldAnimate
                    ? {
                        animation: "slide-in-right 0.3s ease-out both",
                        animationDelay: `${index * 40}ms`,
                      }
                    : undefined
                }
              >
                <TableCell className="font-mono font-medium w-24">
                  {currency.code}
                </TableCell>
                <TableCell>{currency.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => onEdit(currency)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">تعديل</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => onDelete(currency)}
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
        {currencies.map((currency, index) => (
          <div
            key={currency.id}
            className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
            style={
              shouldAnimate
                ? {
                    animation: "fade-up 0.4s ease-out both",
                    animationDelay: `${index * 50}ms`,
                  }
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-card-foreground">
                  {currency.name}
                </p>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">
                  {currency.code}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onEdit(currency)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">تعديل</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
                  onClick={() => onDelete(currency)}
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
