"use client"

import { useTrusts } from "@/lib/api/hooks"
import { CurrencyDonutChart } from "@/components/features/trusts/currency-chart"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Coins, CheckCircle2, Clock, XCircle, RotateCcw, PackageCheck } from "lucide-react"
import { useMemo } from "react"

export default function StatsPage() {
  const { data: trustsData, isLoading: trustsLoading } = useTrusts()

  const isLoading = trustsLoading

  const totalTrusts = trustsData?.count ?? 0
  const trusts = trustsData?.results ?? []

  // Compute currency totals from all trusts (regardless of status)
  const currencyTotals = useMemo(() => {
    const map = new Map<string, { code: string; name: string; total: number }>()
    for (const trust of trusts) {
      const code = trust.currency.code
      const existing = map.get(code)
      const amount = parseFloat(trust.amount) || 0
      if (existing) {
        existing.total += amount
      } else {
        map.set(code, { code, name: trust.currency.name, total: amount })
      }
    }
    return Array.from(map.values())
  }, [trusts])

  const totalCurrencies = currencyTotals.length

  // Count trusts by status from current page results
  const activeTrusts = trusts.filter((t) => t.status === "active").length
  const pendingTrusts = trusts.filter((t) => t.status === "pending").length
  const returnedTrusts = trusts.filter((t) => t.status === "returned").length
  const cancelledTrusts = trusts.filter((t) => t.status === "cancelled").length
  const deliveredTrusts = trusts.filter((t) => t.status === "delivered").length

  const stats = [
    {
      label: "إجمالي الأمانات",
      value: totalTrusts,
      icon: TrendingUp,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "عملات نشطة",
      value: totalCurrencies,
      icon: Coins,
      iconBg: "bg-accent/60",
      iconColor: "text-accent-foreground",
    },
    {
      label: "نشطة",
      value: activeTrusts,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "معلّقة",
      value: pendingTrusts,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "مُرجعة",
      value: returnedTrusts,
      icon: RotateCcw,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "ملغاة",
      value: cancelledTrusts,
      icon: XCircle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "تم التسليم",
      value: deliveredTrusts,
      icon: PackageCheck,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإحصائيات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          ملخص وتوزيع الأمانات المالية
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className="rounded-2xl border-border/50 shadow-sm"
            style={{
              animation: "fade-up 0.4s ease-out both",
              animationDelay: `${index * 50}ms`,
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <div className="h-7 w-10 rounded-lg skeleton-shimmer mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donut Chart */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{
          animation: "fade-up 0.4s ease-out both",
          animationDelay: "300ms",
        }}
      >
        <CurrencyDonutChart trusts={trusts} isLoading={trustsLoading} />
      </div>

      {/* Summary Table */}
      {currencyTotals.length > 0 && (
        <Card
          className="rounded-2xl border-border/50 shadow-sm overflow-hidden"
          style={{
            animation: "fade-up 0.4s ease-out both",
            animationDelay: "400ms",
          }}
        >
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
              <p className="text-sm font-semibold text-foreground">
                تفاصيل حسب العملة
              </p>
            </div>
            <div className="divide-y divide-border/30">
              {currencyTotals.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono w-10">
                      {item.code}
                    </span>
                    <span className="text-sm text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold text-foreground tabular-nums"
                    dir="ltr"
                  >
                    {item.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
