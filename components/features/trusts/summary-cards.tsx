"use client"

import { useRef, useEffect } from "react"
import { useTrustsSummary } from "@/lib/api/trusts"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Euro, Banknote } from "lucide-react"
import gsap from "gsap"

const currencyCards = [
  {
    key: "total_usd" as const,
    label: "إجمالي النشط بالدولار",
    symbol: "USD",
    icon: DollarSign,
  },
  {
    key: "total_eur" as const,
    label: "إجمالي النشط باليورو",
    symbol: "EUR",
    icon: Euro,
  },
  {
    key: "total_nis" as const,
    label: "إجمالي النشط بالشيكل",
    symbol: "NIS",
    icon: Banknote,
  },
]

export function SummaryCards() {
  const { data, isLoading, isError } = useTrustsSummary()
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".summary-card")
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
        }
      )
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-destructive/10 p-4 text-center text-sm text-destructive">
        فشل في تحميل الملخص
      </div>
    )
  }

  return (
    <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {currencyCards.map((card) => {
        const value = data[card.key] ?? 0
        return (
          <Card
            key={card.key}
            className="summary-card rounded-2xl shadow-md hover:shadow-lg transition-shadow border-border/50"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-card-foreground tabular-nums" dir="ltr">
                {typeof value === "number"
                  ? value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{card.symbol}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
