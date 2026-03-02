"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  useCreateTrustWithPerson,
  useUpdateTrust,
  useCurrencies,
  usePersons,
} from "@/lib/api/hooks"
import type { Trust, Person } from "@/lib/api/generated/model"
import type { StatusEnum } from "@/lib/api/generated/model"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, User, UserPlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TrustFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trust?: Trust | null
  onDelete?: (trust: Trust) => void
}

export function TrustFormModal({
  open,
  onOpenChange,
  trust,
  onDelete,
}: TrustFormModalProps) {
  const isEditing = !!trust
  const createTrust = useCreateTrustWithPerson()
  const updateTrust = useUpdateTrust()
  const { data: currencies } = useCurrencies()

  // Unified person search state
  const [personName, setPersonName] = useState("")
  const [personPhone, setPersonPhone] = useState("")
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: persons } = usePersons(debouncedSearch || undefined)

  const [amount, setAmount] = useState("")
  const [currencyId, setCurrencyId] = useState<string>("")
  const [status, setStatus] = useState<StatusEnum>("active")
  const [notes, setNotes] = useState("")

  // Debounced person search
  const handlePersonNameChange = useCallback((value: string) => {
    setPersonName(value)
    setSelectedPerson(null) // Clear selection when typing
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length >= 1) {
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value.trim())
        setShowDropdown(true)
      }, 300)
    } else {
      setDebouncedSearch("")
      setShowDropdown(false)
    }
  }, [])

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson(person)
    setPersonName(person.name)
    setPersonPhone(person.phone || "")
    setShowDropdown(false)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (trust) {
      setPersonName(trust.person.name)
      setPersonPhone(trust.person.phone || "")
      setSelectedPerson(trust.person)
      setAmount(trust.amount)
      setCurrencyId(String(trust.currency.id))
      setStatus(trust.status)
      setNotes(trust.notes || "")
    } else {
      setPersonName("")
      setPersonPhone("")
      setSelectedPerson(null)
      setDebouncedSearch("")
      setShowDropdown(false)
      setAmount("")
      setCurrencyId(currencies?.[0]?.id ? String(currencies[0].id) : "")
      setStatus("active")
      setNotes("")
    }
  }, [trust, open, currencies])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (isEditing && trust) {
        await updateTrust.mutateAsync({
          id: trust.id,
          data: {
            person_id: selectedPerson ? selectedPerson.id : undefined,
            amount,
            currency_id: Number(currencyId),
            status,
            notes: notes || undefined,
          },
        })
        toast.success("تم تحديث الأمانة بنجاح")
      } else {
        if (selectedPerson) {
          // Existing person selected
          await createTrust.mutateAsync({
            person_id: selectedPerson.id,
            amount,
            currency_id: Number(currencyId),
            status,
            notes: notes || undefined,
          })
        } else {
          // New person
          await createTrust.mutateAsync({
            person: {
              name: personName,
              phone: personPhone || undefined,
            },
            amount,
            currency_id: Number(currencyId),
            status,
            notes: notes || undefined,
          })
        }
        toast.success("تم إضافة الأمانة بنجاح")
      }
      onOpenChange(false)
    } catch {
      toast.error(isEditing ? "فشل تحديث الأمانة" : "فشل إضافة الأمانة")
    }
  }

  const isSubmitting = createTrust.isPending || updateTrust.isPending
  const isNewPerson = personName.trim().length > 0 && !selectedPerson

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "تعديل الأمانة" : "إضافة أمانة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-2"
        >
          {/* Person Section — Unified Search */}
          {!isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="personName">اسم الشخص</Label>
                  {personName.trim().length > 0 && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-medium gap-1",
                        selectedPerson
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-accent/50 text-accent-foreground border-accent-foreground/20"
                      )}
                    >
                      {selectedPerson ? (
                        <>
                          <User className="h-3 w-3" />
                          شخص موجود
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          شخص جديد
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <div className="relative" ref={dropdownRef}>
                  <Input
                    id="personName"
                    value={personName}
                    onChange={(e) => handlePersonNameChange(e.target.value)}
                    onFocus={() => {
                      if (debouncedSearch && !selectedPerson) setShowDropdown(true)
                    }}
                    placeholder="اكتب اسم الشخص للبحث أو إضافة جديد..."
                    required
                    className="h-11 rounded-xl"
                    autoComplete="off"
                  />
                  {/* Autocomplete dropdown */}
                  {showDropdown && persons && persons.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-border/60 bg-popover shadow-lg overflow-hidden animate-scale-fade-in">
                      <div className="max-h-40 overflow-y-auto py-1">
                        {persons.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPerson(p)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors text-start"
                          >
                            <span className="font-medium text-foreground">{p.name}</span>
                            {p.phone && (
                              <span className="text-xs text-muted-foreground" dir="ltr">
                                {p.phone}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="personPhone">
                  {"رقم الهاتف "}
                  <span className="text-muted-foreground text-xs">
                    {"(اختياري)"}
                  </span>
                </Label>
                <Input
                  id="personPhone"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  placeholder="+962791234567"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label>الشخص</Label>
              <div className="h-11 rounded-xl bg-muted/50 border border-input flex items-center px-3 text-sm text-muted-foreground">
                {trust?.person.name}
                {trust?.person.phone ? ` (${trust.person.phone})` : ""}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="h-11 rounded-xl tabular-nums"
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>العملة</Label>
              <Select value={currencyId} onValueChange={setCurrencyId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>الحالة</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as StatusEnum)}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="returned">مُرجع</SelectItem>
                <SelectItem value="pending">معلّق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات إضافية (اختياري)"
              className="rounded-xl min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة الأمانة"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl"
              >
                إلغاء
              </Button>
            </div>
            {isEditing && trust && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(trust)
                }}
                className="h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                حذف هذه الأمانة
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
