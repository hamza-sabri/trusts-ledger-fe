"use client"

import { AuthProvider, useAuth } from "@/lib/auth/auth-context"
import { QueryProvider } from "@/providers/query-provider"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login")
    }
  }, [isLoading, token, router])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-32 rounded-full skeleton-shimmer" />
            <div className="h-2.5 w-20 rounded-full skeleton-shimmer" style={{ animationDelay: "200ms" }} />
          </div>
        </div>
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="flex min-h-dvh bg-background">
      <DesktopSidebar />

      <main className="flex-1 flex flex-col min-h-dvh md:ms-64">
        <MobileHeader />

        <div className="flex-1 p-4 pb-24 md:p-6 md:pb-6 animate-fade-in">
          {children}
        </div>

        <MobileBottomNav />
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <DashboardGuard>{children}</DashboardGuard>
      </AuthProvider>
    </QueryProvider>
  )
}
