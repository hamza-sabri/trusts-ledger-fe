"use client"

import { useState } from "react"
import type { Currency } from "@/lib/api/generated/model"
import { CurrenciesTable } from "@/components/features/currencies/currencies-table"
import { CurrencyFormModal } from "@/components/features/currencies/currency-form-modal"
import { CurrencyDeleteModal } from "@/components/features/currencies/currency-delete-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CurrenciesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteCurrency, setDeleteCurrency] = useState<Currency | null>(null)

  function handleEdit(currency: Currency) {
    setEditCurrency(currency)
    setFormOpen(true)
  }

  function handleDelete(currency: Currency) {
    setDeleteCurrency(currency)
    setDeleteOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditCurrency(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">العملات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة العملات المتاحة في النظام
          </p>
        </div>
        <Button
          onClick={() => {
            setEditCurrency(null)
            setFormOpen(true)
          }}
          className="h-11 rounded-xl gap-2 font-semibold mt-3 sm:mt-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          إضافة عملة جديدة
        </Button>
      </div>

      <CurrenciesTable onEdit={handleEdit} onDelete={handleDelete} />

      <CurrencyFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        currency={editCurrency}
      />
      <CurrencyDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        currency={deleteCurrency}
      />
    </div>
  )
}
