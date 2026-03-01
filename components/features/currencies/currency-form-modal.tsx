"use client"

import { useEffect, useState } from "react"
import { useCreateCurrency, useUpdateCurrency } from "@/lib/api/hooks"
import type { Currency } from "@/lib/api/generated/model"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CurrencyFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency?: Currency | null
}

export function CurrencyFormModal({
  open,
  onOpenChange,
  currency,
}: CurrencyFormModalProps) {
  const isEditing = !!currency
  const createCurrency = useCreateCurrency()
  const updateCurrency = useUpdateCurrency()

  const [code, setCode] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (currency) {
      setCode(currency.code)
      setName(currency.name)
    } else {
      setCode("")
      setName("")
    }
  }, [currency, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (isEditing && currency) {
        await updateCurrency.mutateAsync({
          id: currency.id,
          data: { code, name },
        })
        toast.success("تم تحديث العملة بنجاح")
      } else {
        await createCurrency.mutateAsync({ code, name })
        toast.success("تم إضافة العملة بنجاح")
      }
      onOpenChange(false)
    } catch {
      toast.error(isEditing ? "فشل تحديث العملة" : "فشل إضافة العملة")
    }
  }

  const isSubmitting = createCurrency.isPending || updateCurrency.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "تعديل العملة" : "إضافة عملة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-2"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="currencyCode">رمز العملة</Label>
            <Input
              id="currencyCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="USD"
              required
              maxLength={5}
              className="h-11 rounded-xl font-mono border-border/60 focus:border-primary"
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="currencyName">اسم العملة</Label>
            <Input
              id="currencyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="دولار أمريكي"
              required
              maxLength={100}
              className="h-11 rounded-xl border-border/60 focus:border-primary"
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
                "إضافة العملة"
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
