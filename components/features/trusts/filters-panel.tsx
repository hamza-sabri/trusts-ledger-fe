"use client"

import { useState, useRef, useCallback } from "react"
import { useCurrencies } from "@/lib/api/hooks"
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
  const [isOpen, setIsOpen] = useState(true)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const { data: currencies } = useCurrencies()

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
          className="rounded-xl gap-2 border-border/60"
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

      {/* CSS grid-rows transition for smooth collapse */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-card p-4 sm:grid-cols-3 shadow-sm">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">بحث بالاسم</Label>
              <div className="relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="اكتب اسم الشخص..."
                  defaultValue={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-10 rounded-xl pe-9 text-sm border-border/60 focus:border-primary"
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
                  {currencies?.map((c) => (
                    <SelectItem key={c.id} value={c.code}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
