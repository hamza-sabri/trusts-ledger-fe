"use client"

import { useState } from "react"
import type { Trust } from "@/lib/api/generated/model"
import { TrustsTable } from "@/components/features/trusts/trusts-table"
import { FiltersPanel } from "@/components/features/trusts/filters-panel"
import { TrustFormModal } from "@/components/features/trusts/trust-form-modal"
import { DeleteConfirmModal } from "@/components/features/trusts/delete-confirm-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    status: "",
    currency: "",
    search: "",
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editTrust, setEditTrust] = useState<Trust | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTrust, setDeleteTrust] = useState<Trust | null>(null)

  function handleEdit(trust: Trust) {
    setEditTrust(trust)
    setFormOpen(true)
  }

  function handleDelete(trust: Trust) {
    setDeleteTrust(trust)
    setDeleteOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditTrust(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            مرحباً بك
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة ومتابعة الأمانات المالية
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTrust(null)
            setFormOpen(true)
          }}
          className="h-11 rounded-xl gap-2 font-semibold mt-3 sm:mt-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          إضافة أمانة جديدة
        </Button>
      </div>

      {/* Filters */}
      <FiltersPanel filters={filters} onFiltersChange={setFilters} />

      {/* Trusts Table */}
      <TrustsTable
        filters={filters}
        onEdit={handleEdit}
      />

      {/* Modals */}
      <TrustFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        trust={editTrust}
        onDelete={handleDelete}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trust={deleteTrust}
      />
    </div>
  )
}
