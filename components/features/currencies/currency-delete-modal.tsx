"use client"

import { useDeleteCurrency } from "@/lib/api/hooks"
import type { Currency } from "@/lib/api/generated/model"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

interface CurrencyDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: Currency | null
}

export function CurrencyDeleteModal({
  open,
  onOpenChange,
  currency,
}: CurrencyDeleteModalProps) {
  const deleteCurrency = useDeleteCurrency()

  async function handleDelete() {
    if (!currency) return
    try {
      await deleteCurrency.mutateAsync(currency.id)
      toast.success("تم حذف العملة بنجاح")
      onOpenChange(false)
    } catch {
      toast.error("فشل حذف العملة")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-sm">
        <AlertDialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mb-2">
            <TriangleAlert className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg">حذف العملة</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {"هل أنت متأكد من حذف العملة"}{" "}
            <span className="font-semibold text-foreground">
              {currency?.name} ({currency?.code})
            </span>
            {"؟"} {"لا يمكن التراجع عن هذا الإجراء."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCurrency.isPending}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCurrency.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin ms-2" />
            ) : null}
            نعم، حذف
          </AlertDialogAction>
          <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
