"use client"

import type { Trust } from "@/lib/api/generated/model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, Label } from "recharts"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface CurrencyDonutChartProps {
  trusts?: Trust[]
  isLoading?: boolean
}

export function CurrencyDonutChart({ trusts, isLoading }: CurrencyDonutChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="h-4 w-40 mb-6 rounded-lg skeleton-shimmer" />
          <div className="flex items-center justify-center">
            <div className="h-[220px] w-[220px] rounded-full skeleton-shimmer" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trusts || trusts.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70">
            <svg
              className="h-7 w-7 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            لا توجد بيانات كافية للرسم البياني
          </p>
        </CardContent>
      </Card>
    )
  }

  // Aggregate totals per currency from all trusts (regardless of status)
  const currencyMap = new Map<string, { name: string; total: number }>()
  for (const trust of trusts) {
    const code = trust.currency.code
    const existing = currencyMap.get(code)
    const amount = parseFloat(trust.amount) || 0
    if (existing) {
      existing.total += amount
    } else {
      currencyMap.set(code, { name: trust.currency.name, total: amount })
    }
  }

  const grandTotal = Array.from(currencyMap.values()).reduce(
    (sum, item) => sum + item.total,
    0
  )

  const chartData = Array.from(currencyMap.entries()).map(([code, item], i) => {
    const pct = grandTotal > 0 ? ((item.total / grandTotal) * 100) : 0
    return {
      currency: code,
      name: item.name,
      value: item.total,
      percentage: pct,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }
  })

  // Build dynamic chart config
  const chartConfig: ChartConfig = {}
  chartData.forEach((d) => {
    chartConfig[d.currency] = {
      label: d.name || d.currency,
      color: d.fill,
    }
  })

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          توزيع الأمانات حسب العملة
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                    <p className="font-medium text-foreground mb-1">
                      {d.name || d.currency}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ background: d.fill }}
                      />
                      <span className="text-muted-foreground">الإجمالي:</span>
                      <span className="font-mono font-medium tabular-nums text-foreground" dir="ltr">
                        {Number(d.value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      النسبة: {d.percentage.toFixed(1)}%
                    </p>
                  </div>
                )
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="currency"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              strokeWidth={2}
              stroke="var(--background)"
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.currency} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {chartData.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          عملات
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {chartData.map((d) => (
            <div key={d.currency} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: d.fill }}
              />
              <span className="text-muted-foreground">{d.name || d.currency}</span>
              <span className="font-medium text-foreground tabular-nums">
                {d.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
