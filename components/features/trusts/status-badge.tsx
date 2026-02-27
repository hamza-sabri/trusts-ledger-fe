"use client"

import { Badge } from "@/components/ui/badge"
import type { TrustStatus } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  TrustStatus,
  { label: string; className: string }
> = {
  active: {
    label: "نشط",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  returned: {
    label: "مُرجع",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  pending: {
    label: "معلّق",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  cancelled: {
    label: "ملغي",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  },
}

export function StatusBadge({ status }: { status: TrustStatus }) {
  const config = statusConfig[status] || statusConfig.active
  return (
    <Badge
      variant="outline"
      className={cn("rounded-lg font-medium text-xs px-2.5 py-0.5", config.className)}
    >
      {config.label}
    </Badge>
  )
}

export function getStatusLabel(status: TrustStatus): string {
  return statusConfig[status]?.label || status
}
