"use client"

import { useEffect, useRef, useState } from "react"
import { useCreateTrust, useUpdateTrust } from "@/lib/api/trusts"
import type { Trust, TrustCreate, Currency, TrustStatus } from "@/lib/api/types"
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
  const createTrust = useCreateTrust()
  const updateTrust = useUpdateTrust()
  const formRef = useRef<HTMLFormElement>(null)

  const [personName, setPersonName] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("USD")
  const [status, setStatus] = useState<TrustStatus>("active")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (trust) {
      setPersonName(trust.person_name)
      setAmount(trust.amount)
      setCurrency(trust.currency)
      setStatus(trust.status)
      setNotes(trust.notes || "")
    } else {
      setPersonName("")
      setAmount("")
      setCurrency("USD")
      setStatus("active")
      setNotes("")
    }
  }, [trust, open])

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

    const data: TrustCreate = {
      person_name: personName,
      amount,
      currency,
      status,
      notes: notes || undefined,
    }

    try {
      if (isEditing && trust) {
        await updateTrust.mutateAsync({ id: trust.id, data })
        toast.success("تم تحديث الأمانة بنجاح")
      } else {
        await createTrust.mutateAsync(data)
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="personName">اسم الشخص</Label>
            <Input
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="أدخل اسم الشخص"
              required
              className="h-11 rounded-xl"
            />
          </div>

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
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                  <SelectItem value="EUR">يورو</SelectItem>
                  <SelectItem value="NIS">شيكل</SelectItem>
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
