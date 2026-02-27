"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal, X, Search } from "lucide-react"
import gsap from "gsap"

interface Filters {
  status: string
  currency: string
  search: string
}

interface FiltersPanelProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        gsap.fromTo(
          panelRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
        )
      } else {
        gsap.to(panelRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        })
      }
    }
  }, [isOpen])

  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value })
      }, 300)
    },
    [filters, onFiltersChange]
  )

  const hasActiveFilters = filters.status || filters.currency || filters.search

  const clearFilters = () => {
    onFiltersChange({ status: "", currency: "", search: "" })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          الفلاتر
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {[filters.status, filters.currency, filters.search].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="rounded-xl gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div ref={panelRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">بحث بالاسم</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="اكتب اسم الشخص..."
                defaultValue={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-10 rounded-xl pr-9 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">الحالة</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, status: v === "all" ? "" : v })
              }
            >
              <SelectTrigger className="h-10 rounded-xl text-sm">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="returned">مُرجع</SelectItem>
                <SelectItem value="pending">معلّق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">العملة</Label>
            <Select
              value={filters.currency || "all"}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, currency: v === "all" ? "" : v })
              }
            >
              <SelectTrigger className="h-10 rounded-xl text-sm">
                <SelectValue placeholder="جميع العملات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملات</SelectItem>
                <SelectItem value="USD">دولار أمريكي</SelectItem>
                <SelectItem value="EUR">يورو</SelectItem>
                <SelectItem value="NIS">شيكل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
