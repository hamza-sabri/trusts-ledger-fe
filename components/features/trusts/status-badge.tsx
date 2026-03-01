"use client"

import { Badge } from "@/components/ui/badge"
import type { StatusEnum } from "@/lib/api/generated/model"
import { cn } from "@/lib/utils"

type TrustStatus = StatusEnum

const statusConfig: Record<
  TrustStatus,
  { label: string; className: string; dotColor: string }
> = {
  active: {
    label: "نشط",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    dotColor: "bg-emerald-500",
  },
  returned: {
    label: "مُرجع",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    dotColor: "bg-blue-500",
  },
  pending: {
    label: "معلّق",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    dotColor: "bg-amber-500",
  },
  cancelled: {
    label: "ملغي",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    dotColor: "bg-red-500",
  },
}

export function StatusBadge({ status }: { status: TrustStatus }) {
  const config = statusConfig[status] || statusConfig.active
  return (
    <Badge
      variant="outline"
      className={cn("rounded-lg font-semibold text-xs px-2.5 py-0.5 gap-1.5", config.className)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)} />
      {config.label}
    </Badge>
  )
}

export function getStatusLabel(status: TrustStatus): string {
  return statusConfig[status]?.label || status
}
