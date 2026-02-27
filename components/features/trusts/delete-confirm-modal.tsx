"use client"

import { useDeleteTrust } from "@/lib/api/trusts"
import type { Trust } from "@/lib/api/types"
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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trust: Trust | null
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  trust,
}: DeleteConfirmModalProps) {
  const deleteTrust = useDeleteTrust()

  async function handleDelete() {
    if (!trust) return
    try {
      await deleteTrust.mutateAsync(trust.id)
      toast.success("تم حذف الأمانة بنجاح")
      onOpenChange(false)
    } catch {
      toast.error("فشل حذف الأمانة")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">حذف الأمانة</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {"هل أنت متأكد من حذف أمانة"}{" "}
            <span className="font-semibold text-foreground">
              {trust?.person_name}
            </span>
            {"؟"} {"لا يمكن التراجع عن هذا الإجراء."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTrust.isPending}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTrust.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : null}
            نعم، حذف
          </AlertDialogAction>
          <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
