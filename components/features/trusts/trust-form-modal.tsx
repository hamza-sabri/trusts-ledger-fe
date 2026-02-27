"use client"

import { useEffect, useRef, useState } from "react"
import {
  useCreateTrustWithPerson,
  useUpdateTrust,
  useCurrencies,
  usePersons,
} from "@/lib/api/trusts"
import type { Trust, TrustStatus } from "@/lib/api/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import gsap from "gsap"

interface TrustFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trust?: Trust | null
}

export function TrustFormModal({
  open,
  onOpenChange,
  trust,
}: TrustFormModalProps) {
  const isEditing = !!trust
  const createTrust = useCreateTrustWithPerson()
  const updateTrust = useUpdateTrust()
  const { data: currencies } = useCurrencies()
  const formRef = useRef<HTMLFormElement>(null)

  // Person mode: "existing" or "new"
  const [personMode, setPersonMode] = useState<"existing" | "new">("new")
  const [personSearch, setPersonSearch] = useState("")
  const { data: persons } = usePersons(personSearch)

  const [selectedPersonId, setSelectedPersonId] = useState<string>("")
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonPhone, setNewPersonPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [currencyId, setCurrencyId] = useState<string>("")
  const [status, setStatus] = useState<TrustStatus>("active")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (trust) {
      setPersonMode("existing")
      setSelectedPersonId(String(trust.person.id))
      setNewPersonName("")
      setNewPersonPhone("")
      setAmount(trust.amount)
      setCurrencyId(String(trust.currency.id))
      setStatus(trust.status)
      setNotes(trust.notes || "")
    } else {
      setPersonMode("new")
      setSelectedPersonId("")
      setNewPersonName("")
      setNewPersonPhone("")
      setAmount("")
      setCurrencyId(currencies?.[0]?.id ? String(currencies[0].id) : "")
      setStatus("active")
      setNotes("")
    }
  }, [trust, open, currencies])

  useEffect(() => {
    if (open && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (isEditing && trust) {
        await updateTrust.mutateAsync({
          id: trust.id,
          data: {
            person_id: selectedPersonId ? Number(selectedPersonId) : undefined,
            amount,
            currency_id: Number(currencyId),
            status,
            notes: notes || undefined,
          },
        })
        toast.success("تم تحديث الأمانة بنجاح")
      } else {
        // Create with inline person support
        if (personMode === "new") {
          await createTrust.mutateAsync({
            person: {
              name: newPersonName,
              phone: newPersonPhone || undefined,
            },
            amount,
            currency_id: Number(currencyId),
            status,
            notes: notes || undefined,
          })
        } else {
          await createTrust.mutateAsync({
            person_id: Number(selectedPersonId),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "تعديل الأمانة" : "إضافة أمانة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-2"
        >
          {/* Person Section */}
          {!isEditing && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={personMode === "new" ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => setPersonMode("new")}
                >
                  شخص جديد
                </Button>
                <Button
                  type="button"
                  variant={personMode === "existing" ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => setPersonMode("existing")}
                >
                  شخص موجود
                </Button>
              </div>

              {personMode === "new" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPersonName">اسم الشخص</Label>
                    <Input
                      id="newPersonName"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="أدخل اسم الشخص"
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPersonPhone">
                      {"رقم الهاتف "}
                      <span className="text-muted-foreground text-xs">
                        {"(اختياري)"}
                      </span>
                    </Label>
                    <Input
                      id="newPersonPhone"
                      value={newPersonPhone}
                      onChange={(e) => setNewPersonPhone(e.target.value)}
                      placeholder="+962791234567"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label>اختر شخص</Label>
                  <Input
                    placeholder="ابحث عن شخص..."
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    className="h-10 rounded-xl text-sm mb-1"
                  />
                  <Select
                    value={selectedPersonId}
                    onValueChange={setSelectedPersonId}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="اختر شخص" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                          {p.phone ? ` (${p.phone})` : ""}
                        </SelectItem>
                      ))}
                      {(!persons || persons.length === 0) && (
                        <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                          لا توجد نتائج
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {isEditing && (
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
              onValueChange={(v) => setStatus(v as TrustStatus)}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
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

          <div className="flex gap-3 mt-2">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
